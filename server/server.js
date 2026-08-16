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
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Visitor = require('./models/Visitor');
const { curriculumSeedData } = require('./seed');
const { JWT_SECRET } = require('./middleware/auth');
const { swaggerUi, swaggerSpec, customSwaggerOptions } = require('./config/swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection helper for serverless environment
const PORT = process.env.PORT || 5001;
const rawMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';
// Sanitize URI: strip quotes, whitespace, or line breaks accidentally pasted into Vercel UI
const MONGO_URI = rawMongoUri.trim().replace(/^["']|["']$/g, '').trim();

let dbPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if ((!process.env.MONGODB_URI && !process.env.MONGO_URI) && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
    throw new Error('MONGODB_URI environment variable is missing in Vercel deployment settings. Please configure MONGODB_URI under Vercel project Settings -> Environment Variables.');
  }

  if (!MONGO_URI.startsWith('mongodb://') && !MONGO_URI.startsWith('mongodb+srv://')) {
    throw new Error(`Invalid MONGODB_URI scheme (${MONGO_URI.substring(0, 10)}...). Expected connection string to start with "mongodb://" or "mongodb+srv://". Please check the MONGODB_URI value in Vercel Environment Variables.`);
  }

  if (!dbPromise) {
    dbPromise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      })
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
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }
  await dbPromise;
};

// Ensure DB connection on each request for Vercel serverless functions
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database Connection Failed',
      error: err.message,
      solution: '1. Add MONGODB_URI in Vercel Environment Variables. 2. Ensure MongoDB Atlas Network Access allows 0.0.0.0/0 (Allow access from anywhere).',
    });
  }
});

// Middleware to automatically track visitor IP addresses, visit counts, and logged-in student profiles
app.use(async (req, res, next) => {
  // Ignore static assets, swagger docs, and favicon requests
  const path = req.path || '';
  if (
    path.startsWith('/api-docs') ||
    path.startsWith('/docs') ||
    path.includes('favicon') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.png') ||
    path.endsWith('.ico')
  ) {
    return next();
  }

  const rawIp =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    req.ip ||
    '127.0.0.1';

  const userAgent = req.headers['user-agent'] || '';

  // Extract user info if Authorization Bearer token is present
  let userObj = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        userObj = await User.findById(decoded.id).select('name email role');
      }
    } catch (e) {
      // Ignore token verification errors in tracking middleware
    }
  }

  // Asynchronously record visit without delaying request processing
  Visitor.logVisit(rawIp, userAgent, path, userObj).catch(() => {});

  next();
});

// Ensure trailing slash for Swagger UI routes to resolve relative asset paths
app.use((req, res, next) => {
  if (req.path === '/api-docs' || req.path === '/docs') {
    return res.redirect(301, req.path + '/');
  }
  next();
});

// Serve Swagger UI API Documentation Dashboard
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, customSwaggerOptions));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, customSwaggerOptions));
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root route for Vercel deployment health check & Swagger redirect link
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'LMS Express Backend Server is running on Vercel',
    swaggerDocs: '/api-docs',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LMS Backend Server is running smoothly', swaggerDocs: '/api-docs' });
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
  res.status(404).json({ error: 'Endpoint not found', path: req.path, swaggerDocs: '/api-docs' });
});

// Standalone listener for local dev
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 LMS Express Backend Server running on port ${PORT}`);
    console.log(`📑 Swagger Documentation available at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
