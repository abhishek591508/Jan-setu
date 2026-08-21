const User = require('../models/User');
const Post = require('../models/Post');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const posts = await Post.find({ createdBy: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const resolved = await Post.find({ resolvedBy: user._id })
      .sort({ resolvedAt: -1 })
      .limit(50);

    res.json({
      user: user.toPublicJSON(),
      posts,
      resolved
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile };
