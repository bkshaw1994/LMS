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
const { curriculumSeedData } = require('./seed');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection helper for serverless environment
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

let dbPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!dbPromise) {
    dbPromise = mongoose
      .connect(MONGO_URI)
      .then(async () => {
        console.log('MongoDB Atlas connected successfully');
        try {
          await User.collection.dropIndex('email_1');
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
      })
      .catch((err) => {
        dbPromise = null;
        console.warn('MongoDB connection warning:', err.message);
      });
  }
  await dbPromise;
};

// Ensure DB connection on each request for Vercel serverless functions
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Root route for Vercel deployment health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LMS Express Backend Server is running on Vercel' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LMS Backend Server is running smoothly' });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/trainer', trainerRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Standalone listener for local dev
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 LMS Express Backend Server running on port ${PORT}`);
  });
}

module.exports = app;
