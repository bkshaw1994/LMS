const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseModule',
    required: true,
  },
  completedLessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  isModuleCompleted: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a student has only one progress document per module
ProgressSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
