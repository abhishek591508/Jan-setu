const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const parsePoint = (lng, lat) => {
  const longitude = Number(lng);
  const latitude = Number(lat);
  if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
    return {
      type: 'Point',
      coordinates: [longitude, latitude] };
  }
  return undefined;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, lat, lng } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({
        message: 'Email is already registered'
      });
    }

    const location = parsePoint(lng, lat);
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'civilian',
      isApproved: true,
      ...(location ? { location } : {}),
    });

    res.status(201).json({
      token: generateToken(user),
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    if (user.role === 'authority' && !user.isApproved) {
      return res.status(403).json({
        message: 'Your authority account is waiting for admin approval'
      });
    }

    res.json({
      token: generateToken(user),
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({
    user: req.user.toPublicJSON()
  });
};

module.exports = { register, login, me };
