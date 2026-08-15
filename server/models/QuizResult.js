const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
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
  score: {
    type: Number,
    required: true, // Percentage score (0 - 100)
  },
  passed: {
    type: Boolean,
    default: false,
  },
  answers: [
    {
      questionId: String,
      selectedOption: Number,
      isCorrect: Boolean,
    },
  ],
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

QuizResultSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('QuizResult', QuizResultSchema);
