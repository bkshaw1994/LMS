const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  duration: {
    type: String,
    default: '45 mins',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  codeSnippet: { type: String, default: '' },
  type: { type: String, enum: ['mcq', 'code_debug'], default: 'mcq' },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of correct option (0-based)
  explanation: { type: String, required: true },
});

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  starterRepoUrl: { type: String, default: 'https://github.com/fullstack-bootcamp/starter-template' },
  starterFileName: { type: String, default: 'index.js' },
  starterCode: { type: String, default: '// Starter code template\nconsole.log("Welcome to Week Project");' },
  points: { type: Number, default: 100 },
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  passingScore: { type: Number, default: 70 }, // Passing percentage threshold
  questions: [QuestionSchema],
});

const CourseModuleSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: [true, 'Week number is required'],
    unique: true,
    min: 1,
    max: 12,
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Module description is required'],
  },
  category: {
    type: String,
    required: true,
    enum: ['Vanilla JS', 'React', 'Next.js', 'Node.js', 'MongoDB', 'DevOps'],
  },
  lessons: [LessonSchema],
  assignment: AssignmentSchema,
  quiz: QuizSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CourseModule', CourseModuleSchema);
