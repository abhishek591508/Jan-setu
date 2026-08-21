const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const detectMediaType = (mimetype = '') => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype === 'application/pdf') return 'pdf';
  return 'image';
};

const resourceTypeFor = (mediaType) => {
  if (mediaType === 'video' || mediaType === 'audio') return 'video';
  if (mediaType === 'pdf') return 'raw';
  return 'image';
};

const saveLocal = (file, folder) => {
  const uploadsDir = path.join(__dirname, '../../uploads', folder);
  fs.mkdirSync(uploadsDir, { recursive: true });
  const ext = path.extname(file.originalname || '') || '.bin';
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, name), file.buffer);
  return {
    mediaType: detectMediaType(file.mimetype),
    url: `/uploads/${folder}/${name}`,
    publicId: `local/${folder}/${name}` };
};

const uploadBuffer = (file, folder) =>
  new Promise((resolve, reject) => {
    if (!isConfigured()) {
      resolve(saveLocal(file, folder));
      return;
    }

    const mediaType = detectMediaType(file.mimetype);
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `jansetu/${folder}`,
        resource_type: resourceTypeFor(mediaType),
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          mediaType,
          url: result.secure_url,
          publicId: result.public_id });
      }
    );

    stream.end(file.buffer);
  });

const uploadPostImage = (file) => uploadBuffer(file, 'posts');

const uploadProofs = async (files = []) => {
  const uploads = files.map((file) => uploadBuffer(file, 'proofs'));
  return Promise.all(uploads);
};

module.exports = { uploadPostImage, uploadProofs, detectMediaType };
