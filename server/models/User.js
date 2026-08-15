const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Exclude password field by default on queries
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'instructor', 'trainer'],
    default: 'student',
  },
  mobile: {
    type: String,
    default: '',
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
    trim: true,
  },
  resumeUrl: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index allowing a user to have a Student account and a Trainer account with the same email
UserSchema.index({ email: 1, role: 1 }, { unique: true });

// Encrypt password before saving user document
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
