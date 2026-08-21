const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const THRESHOLDS = require('../config/thresholds');
const { applyRanking, civicScoreForPost } = require('../services/rankingService');
const { uploadPostImage, uploadProofs } = require('../services/cloudinaryService');

const CATEGORIES = ['roads', 'electricity', 'water', 'sanitation', 'general'];

const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toPoint = (lng, lat) => {
  return {
    type: 'Point',
    coordinates: [lng, lat] };
};

const populatePost = (query) =>
  query
    .populate('createdBy', 'name civicScore role')
    .populate('claimedBy', 'name department')
    .populate('resolvedBy', 'name department civicScore');

const departmentMatches = (user, post) => {
  if (!user.department || user.department === 'general') return true;
  return post.assignedDepartment === user.department || post.assignedDepartment === 'general';
};

const distanceKm = (fromLngLat, toLngLat) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const [lng1, lat1] = fromLngLat;
  const [lng2, lat2] = toLngLat;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const createPost = async (req, res, next) => {
  try {
    const { title, description, category, address, city, lat, lng } = req.body;
    const latitude = asNumber(lat);
    const longitude = asNumber(lng);

    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required'
      });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: 'Invalid category'
      });
    }
    if (latitude === null || longitude === null) {
      return res.status(400).json({
        message: 'A valid lat and lng are required'
      });
    }
    if (!req.file) {
      return res.status(400).json({
        message: 'A photo of the issue is required'
      });
    }

    const image = await uploadPostImage(req.file);

    const post = new Post({
      title,
      description,
      category,
      assignedDepartment: category,
      address,
      city,
      image: { url: image.url, publicId: image.publicId },
      location: toPoint(longitude, latitude),
      createdBy: req.user._id,
    });

    applyRanking(post);
    await post.save();

    if (longitude !== 0 || latitude !== 0) {
      req.user.location = toPoint(longitude, latitude);
      await req.user.save();
    }

    const created = await populatePost(Post.findById(post._id));
    res.status(201).json({
      post: created
    });
  } catch (error) {
    next(error);
  }
};

const getFeed = async (req, res, next) => {
  try {
    const lat = asNumber(req.query.lat);
    const lng = asNumber(req.query.lng);
    const includeResolved = req.query.includeResolved === 'true';

    if (lat === null || lng === null) {
      return res.status(400).json({
        message: 'lat and lng query params are required'
      });
    }

    const statusMatch = includeResolved ? {} : { status: { $ne: 'resolved' } };

    const posts = await Post.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          spherical: true,
          query: statusMatch,
        },
      },
      {
        $match: {
          $expr: {
            $lte: ['$distance', { $multiply: ['$visibilityRadiusKm', 1000] }],
          },
        },
      },
      {
        $addFields: {
          feedScore: {
            $add: ['$rankScore', { $divide: [1000, { $add: ['$distance', 1] }] }],
          },
        },
      },
      { $sort: { feedScore: -1 } },
      { $limit: THRESHOLDS.feedLimit },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [{ $project: { name: 1, civicScore: 1, role: 1 } }],
        },
      },
      { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
    ]);

    res.json({
      posts
    });
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid post id'
      });
    }

    const post = await populatePost(Post.findById(req.params.id));
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    res.json({
      post,
      hasUpvoted: post.upvotedBy.some((id) => id.toString() === req.user._id.toString())
    });
  } catch (error) {
    next(error);
  }
};

const upvotePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }
    if (post.status === 'resolved') {
      return res.status(400).json({
        message: 'Resolved issues cannot be upvoted'
      });
    }
    if (post.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot upvote your own report'
      });
    }
    if (post.upvotedBy.some((id) => id.toString() === req.user._id.toString())) {
      return res.status(400).json({
        message: 'You already upvoted this issue'
      });
    }

    post.upvotedBy.push(req.user._id);
    post.upvoteCount += 1;
    applyRanking(post);
    await post.save();

    const updated = await populatePost(Post.findById(post._id));
    res.json({
      post: updated,
      hasUpvoted: true
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role === 'admin') {
      const all = await populatePost(
        Post.find({ status: { $in: ['open', 'in_progress'] } }).sort({
          escalationLevel: -1,
          rankScore: -1,
          createdAt: -1,
        })
      );
      return res.json({
        posts: all
      });
    }

    const center = user.jurisdiction?.center?.coordinates || [0, 0];
    const hasCenter = center[0] !== 0 || center[1] !== 0;
    const radiusKm = user.jurisdiction?.radiusKm || 5;
    const city = (user.jurisdiction?.city || '').trim();
    const level = user.level || 1;
    const wideRadiusKm = radiusKm * (level >= 2 ? 3 : 1);

    const match = {
      status: { $in: ['open', 'in_progress'] },
    };

    const geoOrCity = [];
    if (hasCenter) {
      geoOrCity.push({
        location: {
          $geoWithin: {
            $centerSphere: [center, wideRadiusKm / 6378.1],
          },
        },
      });
    }
    if (city) {
      geoOrCity.push({ city: new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    }
    if (geoOrCity.length) match.$or = geoOrCity;

    let posts = await populatePost(
      Post.find(match).sort({ escalationLevel: -1, rankScore: -1, createdAt: -1 })
    );

    posts = posts.filter((post) => departmentMatches(user, post));

    posts = posts.filter((post) => {
      const coords = post.location?.coordinates || [0, 0];
      const inLocalRadius = hasCenter ? distanceKm(center, coords) <= radiusKm : Boolean(city);
      const inWideRadius = hasCenter ? distanceKm(center, coords) <= wideRadiusKm : Boolean(city);
      const sameCity =
        city && post.city ? post.city.toLowerCase() === city.toLowerCase() : false;

      if (level >= 2) {
        return inWideRadius || post.escalationLevel >= 2 || (sameCity && post.escalationLevel >= 1);
      }
      return inLocalRadius || post.escalationLevel >= 1;
    });

    res.json({
      posts
    });
  } catch (error) {
    next(error);
  }
};

const claimPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }
    if (post.status === 'resolved') {
      return res.status(400).json({
        message: 'This issue is already resolved'
      });
    }
    if (!departmentMatches(req.user, post)) {
      return res.status(403).json({
        message: 'This issue is outside your department'
      });
    }

    post.status = 'in_progress';
    post.claimedBy = req.user._id;
    await post.save();

    const updated = await populatePost(Post.findById(post._id));
    res.json({
      post: updated
    });
  } catch (error) {
    next(error);
  }
};

const resolvePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }
    if (post.status === 'resolved') {
      return res.status(400).json({
        message: 'This issue is already resolved'
      });
    }
    if (!departmentMatches(req.user, post)) {
      return res.status(403).json({
        message: 'This issue is outside your department'
      });
    }

    const files = req.files || [];
    if (files.length) {
      const proofs = await uploadProofs(files);
      post.resolutionProofs = proofs;
    }

    post.status = 'resolved';
    post.resolvedBy = req.user._id;
    post.resolvedAt = new Date();
    if (!post.claimedBy) post.claimedBy = req.user._id;

    const points = civicScoreForPost(post.upvoteCount);
    if (!post.civicScoreAwarded) {
      await User.updateOne({ _id: post.createdBy }, { $inc: { civicScore: points } });
      await User.updateOne({ _id: req.user._id }, { $inc: { civicScore: points } });
      post.civicScoreAwarded = true;
    }

    await post.save();
    const updated = await populatePost(Post.findById(post._id));
    res.json({
      post: updated,
      civicScoreAwarded: points
    });
  } catch (error) {
    next(error);
  }
};

const getMyPosts = async (req, res, next) => {
  try {
    const posts = await populatePost(
      Post.find({ createdBy: req.user._id }).sort({ createdAt: -1 })
    );
    res.json({
      posts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeed,
  getPost,
  upvotePost,
  getDashboard,
  claimPost,
  resolvePost,
  getMyPosts,
};
