const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const modulesRoutes = require('./routes/modules');
const progressRoutes = require('./routes/progress');
const assignmentsRoutes = require('./routes/assignments');
const quizzesRoutes = require('./routes/quizzes');
const trainerRoutes = require('./routes/trainer');
const User = require('./models/User');
const { curriculumSeedData } = require('./seed');

const app = express();

// Middleware - set 50mb limit for base64 image/file uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/trainer', trainerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LMS Backend API', timestamp: new Date() });
});

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Atlas connected successfully');
    const CourseModule = require('./models/CourseModule');
    const count = await CourseModule.countDocuments();
    if (count === 0) {
      console.log('Seeding initial 12-week curriculum data...');
      await CourseModule.insertMany(curriculumSeedData);
    }

    // Seed / Ensure Trainer user account: Bishal Kumar Shaw (b.kumarshaw94@gmail.com)
    const trainerEmail = 'b.kumarshaw94@gmail.com';
    let trainerUser = await User.findOne({ email: trainerEmail, role: 'trainer' });
    if (!trainerUser) {
      console.log(`Seeding trainer account for ${trainerEmail}...`);
      await User.create({
        name: 'Bishal Kumar Shaw',
        email: trainerEmail,
        password: 'C0gniz@nt@09071994',
        role: 'trainer',
        mobile: '+91 9876543210',
      });
      console.log(`Trainer account (${trainerEmail}) created successfully!`);
    } else {
      trainerUser.name = 'Bishal Kumar Shaw';
      trainerUser.password = 'C0gniz@nt@09071994';
      await trainerUser.save();
      console.log(`Trainer account (${trainerEmail}) updated successfully!`);
    }
  })
  .catch((err) => {
    console.warn('MongoDB connection warning:', err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 LMS Express Backend Server running on port ${PORT}`);
});
