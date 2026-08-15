const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const progressRoutes = require('./routes/progress');
const submissionRoutes = require('./routes/assignments');
const quizRoutes = require('./routes/quizzes');
const trainerRoutes = require('./routes/trainer');
const User = require('./models/User');
const curriculumSeedData = require('./seed');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/trainer', trainerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LMS Backend Server is running smoothly' });
});

// Database connection & Seeding
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Atlas connected successfully');

    // Ensure legacy email_1 unique index is dropped so email+role compound index works
    try {
      await User.collection.dropIndex('email_1');
      console.log('Dropped legacy email_1 index from users collection');
    } catch (e) {
      // Legacy index already dropped or doesn't exist
    }
    await User.syncIndexes();

    const CourseModule = require('./models/CourseModule');
    const count = await CourseModule.countDocuments();
    if (count === 0) {
      console.log('Seeding initial 12-week curriculum data...');
      await CourseModule.insertMany(curriculumSeedData);
    } else {
      for (const seedItem of curriculumSeedData) {
        const existingMod = await CourseModule.findOne({ weekNumber: seedItem.weekNumber });
        if (!existingMod) {
          await CourseModule.create(seedItem);
        } else if (!existingMod.assignment || !existingMod.assignment.starterCode || existingMod.assignment.starterRepoUrl.includes('starter-template')) {
          existingMod.assignment = seedItem.assignment;
          await existingMod.save();
        }
      }
    }

    const testEmail = 'b.kumarshaw94@gmail.com';

    // 1. Ensure Trainer User Account (Unique User Document #1)
    let trainerUser = await User.findOne({ email: testEmail, role: 'trainer' }).select('+password');
    if (!trainerUser) {
      console.log(`Seeding trainer account for ${testEmail}...`);
      trainerUser = await User.create({
        name: 'Bishal Kumar Shaw',
        email: testEmail,
        password: 'C0gniz@nt@09071994',
        role: 'trainer',
        mobile: '+91 9876543210',
      });
      console.log(`Trainer account (${testEmail}) created successfully!`);
    } else {
      const isMatch = await trainerUser.matchPassword('C0gniz@nt@09071994');
      if (!isMatch) {
        trainerUser.password = 'C0gniz@nt@09071994';
        await trainerUser.save();
      }
      console.log(`Trainer account (${testEmail}) verified successfully!`);
    }

    // 2. Ensure Student User Account (Unique User Document #2)
    let studentUser = await User.findOne({ email: testEmail, role: 'student' }).select('+password');
    if (!studentUser) {
      console.log(`Seeding student account for ${testEmail}...`);
      studentUser = await User.create({
        name: 'Bishal Kumar Shaw',
        email: testEmail,
        password: 'C0gniz@nt@09071994',
        role: 'student',
        mobile: '+91 9876543210',
      });
      console.log(`Student account (${testEmail}) created successfully!`);
    } else {
      console.log(`Student account (${testEmail}) verified successfully!`);
    }

    // 3. Seed 100% Completion Progress, Submissions, and Test Marks for Student Bishal Kumar Shaw
    const Progress = require('./models/Progress');
    const Submission = require('./models/Submission');
    const QuizResult = require('./models/QuizResult');
    const allModules = await CourseModule.find().sort({ weekNumber: 1 });

    for (const mod of allModules) {
      const lessonIds = (mod.lessons || []).map((l) => l._id);

      // Upsert 100% Lesson Progress
      await Progress.findOneAndUpdate(
        { user: studentUser._id, module: mod._id },
        {
          user: studentUser._id,
          module: mod._id,
          completedLessons: lessonIds,
          isModuleCompleted: true,
          updatedAt: Date.now(),
        },
        { upsert: true, new: true }
      );

      // Upsert GitHub Assignment Project Submission
      await Submission.findOneAndUpdate(
        { user: studentUser._id, module: mod._id },
        {
          user: studentUser._id,
          module: mod._id,
          githubUrl: `https://github.com/b-kumar-shaw/lms-bootcamp-week-${mod.weekNumber}`,
          notes: `Week ${mod.weekNumber} full-stack project completed with 100% test coverage.`,
          status: 'submitted',
          score: 100,
          submittedAt: Date.now(),
        },
        { upsert: true, new: true }
      );

      // Upsert 100% Weekly Knowledge Test Marks
      await QuizResult.findOneAndUpdate(
        { user: studentUser._id, module: mod._id },
        {
          user: studentUser._id,
          module: mod._id,
          score: 100,
          passed: true,
          answers: (mod.quiz?.questions || []).map((q) => ({
            questionId: q.id,
            selectedOption: q.correctAnswer,
            isCorrect: true,
          })),
          completedAt: Date.now(),
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Successfully seeded 100% completion progress, GitHub repos, and 100% test marks for student ${testEmail}!`);
  })
  .catch((err) => {
    console.warn('MongoDB connection warning:', err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 LMS Express Backend Server running on port ${PORT}`);
});
