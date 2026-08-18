const { v2: cloudinary } = require('cloudinary');

const isConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const initCloudinary = () => {
  if (!isConfigured()) {
    console.warn('Cloudinary credentials missing — media uploads will fail until they are set.');
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

module.exports = { cloudinary, initCloudinary, isConfigured };
