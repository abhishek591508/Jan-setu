const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['civilian', 'authority', 'admin'],
      default: 'civilian',
    },
    location: { type: pointSchema, default: () => ({ type: 'Point', coordinates: [0, 0] }) },
    civicScore: { type: Number, default: 0 },
    department: {
      type: String,
      enum: ['roads', 'electricity', 'water', 'sanitation', 'general'],
    },
    jurisdiction: {
      city: { type: String, trim: true },
      center: { type: pointSchema, default: () => ({ type: 'Point', coordinates: [0, 0] }) },
      radiusKm: { type: Number, default: 5 },
    },
    level: { type: Number, enum: [1, 2, 3], default: 1 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ 'jurisdiction.center': '2dsphere' });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    civicScore: this.civicScore,
    department: this.department,
    jurisdiction: this.jurisdiction,
    level: this.level,
    isApproved: this.isApproved,
    location: this.location,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
