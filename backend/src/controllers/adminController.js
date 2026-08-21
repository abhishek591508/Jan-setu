const User = require('../models/User');
const Post = require('../models/Post');
const THRESHOLDS = require('../config/thresholds');

const DEPARTMENTS = ['roads', 'electricity', 'water', 'sanitation', 'general'];
const ROLES = ['civilian', 'authority', 'admin'];

//converts latitude and longitude into GeoJSON Point format.
const toPoint = (lng, lat) => {
  const longitude = Number(lng);
  const latitude = Number(lat);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return undefined;
  }
  return {
    type: 'Point',
    coordinates: [longitude, latitude] };
};
// MongoDB GeoJSON uses longitude first.

const listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role && ROLES.includes(role) ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({
      users: users.map((u) => u.toPublicJSON())
    });
  } catch (error) {
    next(error);
  }
};

const createAuthority = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      department,
      city,
      lat,
      lng,
      radiusKm,
      level,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }
    if (department && !DEPARTMENTS.includes(department)) {
      return res.status(400).json({
        message: 'Invalid department'
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({
        message: 'Email is already registered'
      });
    }

    const center = toPoint(lng, lat);
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'authority',
      department: department || 'general',
      level: Number(level) || 1,
      isApproved: true,
      jurisdiction: {
        city: city || '',
        radiusKm: Number(radiusKm) || 5,
        ...(center ? { center } : {}),
      },
      ...(center ? { location: center } : {}),
    });

    res.status(201).json({
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const {
      name,
      phone,
      role,
      department,
      isApproved,
      city,
      lat,
      lng,
      radiusKm,
      level,
    } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role && ROLES.includes(role)) user.role = role;
    if (department && DEPARTMENTS.includes(department)) user.department = department;
    if (typeof isApproved === 'boolean') user.isApproved = isApproved;
    if (level) user.level = Number(level);

    if (!user.jurisdiction) user.jurisdiction = {};
    if (city !== undefined) user.jurisdiction.city = city;
    if (radiusKm) user.jurisdiction.radiusKm = Number(radiusKm);

    const center = toPoint(lng, lat);
    if (center) {
      user.jurisdiction.center = center;
      user.location = center;
    }

    await user.save();
    res.json({
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

const listPosts = async (req, res, next) => {
  try {
    const { status, category, city } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');

    const posts = await Post.find(filter)
      .populate('createdBy', 'name email civicScore')
      .populate('resolvedBy', 'name department')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      posts
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [users, posts, open, inProgress, resolved, authorities] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: 'open' }),
      Post.countDocuments({ status: 'in_progress' }),
      Post.countDocuments({ status: 'resolved' }),
      User.countDocuments({ role: 'authority' }),
    ]);

    const byCategory = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const byEscalation = await Post.aggregate([
      { $group: { _id: '$escalationLevel', count: { $sum: 1 } } },
    ]);

    res.json({
      stats: {
        users,
        authorities,
        posts,
        open,
        inProgress,
        resolved,
        byCategory,
        byEscalation
      },
      thresholds: THRESHOLDS
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, createAuthority, updateUser, listPosts, getStats };
