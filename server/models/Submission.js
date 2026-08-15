const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
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
  githubUrl: {
    type: String,
    required: [true, 'GitHub repository URL is required'],
    trim: true,
    match: [
      /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/,
      'Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)',
    ],
  },
  notes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted',
  },
  score: {
    type: Number,
    default: 100,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

SubmissionSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
