const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    studentName: {
      type: String,
      default: '',
    },
    studentEmail: {
      type: String,
      default: '',
    },
    userRole: {
      type: String,
      enum: ['student', 'trainer', 'admin', 'instructor', 'guest'],
      default: 'guest',
    },
    visitCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    userAgent: {
      type: String,
      default: 'Unknown Browser / Device',
    },
    lastPath: {
      type: String,
      default: '/',
    },
    firstVisitedAt: {
      type: Date,
      default: Date.now,
    },
    lastVisitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Statics helper method to log or increment visitor count asynchronously
visitorSchema.statics.logVisit = async function (ipAddress, userAgent = '', path = '/', userObj = null) {
  if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1') {
    ipAddress = '127.0.0.1 (Localhost)';
  }

  try {
    const existing = await this.findOne({ ipAddress });

    if (existing) {
      existing.visitCount += 1;
      existing.lastVisitedAt = new Date();
      if (userAgent) existing.userAgent = userAgent;
      if (path) existing.lastPath = path;

      // If a logged-in user is detected, attach student details
      if (userObj) {
        existing.user = userObj._id || userObj.id || existing.user;
        if (userObj.name) existing.studentName = userObj.name;
        if (userObj.email) existing.studentEmail = userObj.email;
        if (userObj.role) existing.userRole = userObj.role;
      }

      await existing.save();
      return existing;
    } else {
      const newVisitor = await this.create({
        ipAddress,
        user: userObj ? (userObj._id || userObj.id) : null,
        studentName: userObj ? (userObj.name || '') : '',
        studentEmail: userObj ? (userObj.email || '') : '',
        userRole: userObj ? (userObj.role || 'guest') : 'guest',
        visitCount: 1,
        userAgent: userAgent || 'Unknown Browser',
        lastPath: path || '/',
        firstVisitedAt: new Date(),
        lastVisitedAt: new Date(),
      });
      return newVisitor;
    }
  } catch (err) {
    // Prevent IP logging errors from breaking main HTTP requests
    console.warn('Visitor IP log warning:', err.message);
    return null;
  }
};

module.exports = mongoose.model('Visitor', visitorSchema);
