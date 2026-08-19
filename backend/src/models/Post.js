const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const mediaSchema = new mongoose.Schema(
  {
    mediaType: { type: String, enum: ['image', 'audio', 'video', 'pdf'] },
    url: String,
    publicId: String,
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['roads', 'electricity', 'water', 'sanitation', 'general'],
      required: true,
    },
    image: {
      url: String,
      publicId: String,
    },
    location: { type: pointSchema, required: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
    upvoteCount: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteVelocity: { type: Number, default: 0 },
    visibilityRadiusKm: { type: Number, default: 1 },
    escalationLevel: { type: Number, enum: [0, 1, 2], default: 0 },
    assignedDepartment: {
      type: String,
      enum: ['roads', 'electricity', 'water', 'sanitation', 'general'],
    },
    rankScore: { type: Number, default: 0 },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    civicScoreAwarded: { type: Boolean, default: false },
    resolutionProofs: [mediaSchema],
  },
  { timestamps: true }
);

postSchema.index({ location: '2dsphere' });
postSchema.index({ status: 1, escalationLevel: 1, assignedDepartment: 1 });
postSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
