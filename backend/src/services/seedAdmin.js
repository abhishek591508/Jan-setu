const User = require('../models/User');

const seedAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@jansetu.local').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) return existing;

  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'JanSetu Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
    isApproved: true,
    civicScore: 0,
  });

  console.log(`Seeded admin account: ${email}`);
  return admin;
};

module.exports = seedAdmin;
