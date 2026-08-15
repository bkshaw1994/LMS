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
    }

    const testEmail = 'b.kumarshaw94@gmail.com';

    // 1. Ensure Trainer User Account (Unique User Document #1)
    let trainerUser = await User.findOne({ email: testEmail, role: 'trainer' }).select('+password');
    if (!trainerUser) {
      console.log(`Seeding trainer account for ${testEmail}...`);
      await User.create({
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
      await User.create({
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
  })
  .catch((err) => {
    console.warn('MongoDB connection warning:', err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 LMS Express Backend Server running on port ${PORT}`);
});
