const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Submission = require('../models/Submission');
const QuizResult = require('../models/QuizResult');
const CourseModule = require('../models/CourseModule');
const Visitor = require('../models/Visitor');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to create URL slug from student name
const slugifyName = (name) => {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
};

// Middleware to authorize trainer / instructor / admin roles
const authorizeTrainer = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'trainer' && user.role !== 'admin' && user.role !== 'instructor')) {
      return res.status(403).json({ success: false, message: 'Access denied: Trainer authorization required' });
    }
    req.userFull = user;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Authorization verification failed' });
  }
};

// @route   GET /api/trainer/students
// @desc    Get dashboard metrics & detailed progress for all enrolled students
// @access  Private (Trainer/Admin only)
router.get('/students', protect, authorizeTrainer, async (req, res) => {
  try {
    const modules = await CourseModule.find().sort({ weekNumber: 1 });
    let totalCourseLessons = 0;
    const moduleLessonCounts = {};
    const moduleWeekLookup = {};
    modules.forEach((mod) => {
      const count = mod.lessons ? mod.lessons.length : 0;
      totalCourseLessons += count;
      moduleLessonCounts[mod._id.toString()] = {
        weekNumber: mod.weekNumber,
        title: mod.title,
        lessonCount: count,
      };
      moduleWeekLookup[mod.weekNumber] = mod._id.toString();
    });

    if (totalCourseLessons === 0) totalCourseLessons = 48;

    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });

    const studentDataPromises = students.map(async (student) => {
      const studentId = student._id;

      const [progressList, submissionsList, quizList] = await Promise.all([
        Progress.find({ $or: [{ user: studentId }, { userId: studentId }] }),
        Submission.find({ $or: [{ user: studentId }, { userId: studentId }] }),
        QuizResult.find({ $or: [{ user: studentId }, { userId: studentId }] }),
      ]);

      let completedLessonsCount = 0;
      const progressByWeek = {};

      progressList.forEach((p) => {
        const completedCount = p.completedLessons ? p.completedLessons.length : 0;
        completedLessonsCount += completedCount;

        const modIdStr = (p.module || p.moduleId || '').toString();
        const modInfo = moduleLessonCounts[modIdStr];
        if (modInfo) {
          progressByWeek[modInfo.weekNumber] = {
            completedCount,
            totalLessons: modInfo.lessonCount,
            isFinished: completedCount >= modInfo.lessonCount && modInfo.lessonCount > 0,
          };
        }
      });

      const overallPercentage = Math.min(100, Math.round((completedLessonsCount / totalCourseLessons) * 100));

      const submissionsByWeek = {};
      submissionsList.forEach((sub) => {
        const modIdStr = (sub.module || sub.moduleId || '').toString();
        const modInfo = moduleLessonCounts[modIdStr];
        const weekNum = sub.weekNumber || (modInfo ? modInfo.weekNumber : null);
        if (weekNum) {
          submissionsByWeek[weekNum] = {
            submissionUrl: sub.githubUrl || sub.submissionUrl,
            submittedAt: sub.submittedAt,
          };
        }
      });

      const quizzesByWeek = {};
      let totalPassedQuizzes = 0;
      let totalQuizScoreSum = 0;

      quizList.forEach((q) => {
        if (q.passed) totalPassedQuizzes++;
        totalQuizScoreSum += (q.score !== undefined ? q.score : q.percentage || 0);

        const modIdStr = (q.module || q.moduleId || '').toString();
        const modInfo = moduleLessonCounts[modIdStr];
        const weekNum = q.weekNumber || (modInfo ? modInfo.weekNumber : null);
        if (weekNum) {
          quizzesByWeek[weekNum] = {
            score: q.score,
            totalQuestions: 4,
            percentage: q.score !== undefined ? q.score : q.percentage,
            passed: q.passed,
            attemptedAt: q.completedAt || q.attemptedAt,
          };
        }
      });

      const avgQuizPercentage = quizList.length > 0 ? Math.round(totalQuizScoreSum / quizList.length) : 0;

      let rank = 'Novice Developer';
      if (overallPercentage >= 100) rank = 'Full-Stack Master';
      else if (overallPercentage >= 75) rank = 'Senior Specialist';
      else if (overallPercentage >= 50) rank = 'Intermediate Specialist';
      else if (overallPercentage >= 25) rank = 'Junior Specialist';

      return {
        id: student._id,
        name: student.name,
        slug: slugifyName(student.name),
        email: student.email,
        mobile: student.mobile || 'N/A',
        avatar: student.avatar || '',
        resumeUrl: student.resumeUrl || '',
        createdAt: student.createdAt,
        rank,
        metrics: {
          completedLessonsCount,
          totalCourseLessons,
          overallPercentage,
          assignmentsSubmittedCount: submissionsList.length,
          quizzesPassedCount: totalPassedQuizzes,
          totalQuizzesAttempted: quizList.length,
          avgQuizPercentage,
        },
        progressByWeek,
        submissionsByWeek,
        quizzesByWeek,
      };
    });

    const studentsDetailed = await Promise.all(studentDataPromises);

    const totalStudents = studentsDetailed.length;
    const avgCohortCompletion = totalStudents > 0
      ? Math.round(studentsDetailed.reduce((acc, s) => acc + s.metrics.overallPercentage, 0) / totalStudents)
      : 0;

    const totalSubmissions = studentsDetailed.reduce((acc, s) => acc + s.metrics.assignmentsSubmittedCount, 0);
    const totalQuizzesPassed = studentsDetailed.reduce((acc, s) => acc + s.metrics.quizzesPassedCount, 0);

    res.status(200).json({
      success: true,
      cohortSummary: {
        totalStudents,
        avgCohortCompletion,
        totalSubmissions,
        totalQuizzesPassed,
      },
      students: studentsDetailed,
    });
  } catch (error) {
    console.error('Error fetching trainer student metrics:', error);
    res.status(500).json({ success: false, message: 'Server error loading trainer data', error: error.message });
  }
});

// @route   GET /api/trainer/student/:identifier
// @desc    Get detailed progress, submissions, and quiz test marks for a single student by ID or Name Slug
// @access  Private (Trainer/Admin only)
router.get('/student/:identifier', protect, authorizeTrainer, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let student = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      student = await User.findById(identifier).select('-password');
    }

    if (!student) {
      const decodedParam = decodeURIComponent(identifier).toLowerCase().trim();
      const allStudents = await User.find({ role: 'student' }).select('-password');
      student = allStudents.find((s) => {
        const slug = slugifyName(s.name);
        const cleanName = s.name.toLowerCase().replace(/\s+/g, ' ');
        return slug === decodedParam || cleanName === decodedParam || s._id.toString() === identifier;
      });
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    const studentId = student._id;
    const modules = await CourseModule.find().sort({ weekNumber: 1 });
    const [progressList, submissionsList, quizList] = await Promise.all([
      Progress.find({ $or: [{ user: studentId }, { userId: studentId }] }),
      Submission.find({ $or: [{ user: studentId }, { userId: studentId }] }),
      QuizResult.find({ $or: [{ user: studentId }, { userId: studentId }] }),
    ]);

    let totalCourseLessons = 0;
    let completedLessonsCount = 0;

    const progressMap = {};
    progressList.forEach((p) => {
      const modIdStr = (p.module || p.moduleId || '').toString();
      progressMap[modIdStr] = p.completedLessons || [];
      completedLessonsCount += (p.completedLessons ? p.completedLessons.length : 0);
    });

    const submissionsMap = {};
    submissionsList.forEach((s) => {
      const modIdStr = (s.module || s.moduleId || '').toString();
      if (modIdStr) submissionsMap[modIdStr] = s;
      if (s.weekNumber) submissionsMap[`week_${s.weekNumber}`] = s;
    });

    const quizMap = {};
    let passedQuizCount = 0;
    let totalScoreSum = 0;
    quizList.forEach((q) => {
      const modIdStr = (q.module || q.moduleId || '').toString();
      if (modIdStr) quizMap[modIdStr] = q;
      if (q.weekNumber) quizMap[`week_${q.weekNumber}`] = q;

      if (q.passed) passedQuizCount++;
      totalScoreSum += (q.score !== undefined ? q.score : q.percentage || 0);
    });

    const weeksData = modules.map((mod) => {
      const lessonCount = mod.lessons ? mod.lessons.length : 0;
      totalCourseLessons += lessonCount;

      const modIdStr = mod._id.toString();
      const completed = progressMap[modIdStr] || [];

      // Find submission by module id or weekNumber
      const sub = submissionsMap[modIdStr] || submissionsMap[`week_${mod.weekNumber}`] || null;

      // Find quiz result by module id or weekNumber
      const quiz = quizMap[modIdStr] || quizMap[`week_${mod.weekNumber}`] || null;

      // Format lesson completion check
      const lessonTitleList = (mod.lessons || []).map((l) => l.title);
      const completedLessonTitles = completed.map((item) => {
        if (typeof item === 'string') return item;
        // If stored as ObjectId, match with lesson._id or title
        const match = (mod.lessons || []).find((l) => l._id && l._id.toString() === item.toString());
        return match ? match.title : item.toString();
      });

      return {
        weekNumber: mod.weekNumber,
        title: mod.title,
        category: mod.category,
        totalLessons: lessonCount,
        lessons: mod.lessons || [],
        completedLessons: completedLessonTitles,
        completedCount: completedLessonTitles.length,
        isLessonsFinished: completedLessonTitles.length >= lessonCount && lessonCount > 0,
        submission: sub ? {
          submissionUrl: sub.githubUrl || sub.submissionUrl,
          submittedAt: sub.submittedAt,
        } : null,
        quizResult: quiz ? (() => {
          const totalQ = (quiz.answers && quiz.answers.length > 0) ? quiz.answers.length : (mod.quiz?.questions?.length || 4);
          const correctQ = (quiz.answers && quiz.answers.length > 0)
            ? quiz.answers.filter(a => a.isCorrect).length
            : (quiz.score <= totalQ ? quiz.score : totalQ);
          const pct = quiz.percentage !== undefined ? quiz.percentage : (quiz.score > totalQ ? quiz.score : Math.round((correctQ / totalQ) * 100));
          return {
            score: correctQ,
            rawScore: correctQ,
            totalQuestions: totalQ,
            percentage: pct,
            passed: quiz.passed,
            attemptedAt: quiz.completedAt || quiz.attemptedAt,
          };
        })() : null,
      };
    });

    if (totalCourseLessons === 0) totalCourseLessons = 48;
    const overallPercentage = Math.min(100, Math.round((completedLessonsCount / totalCourseLessons) * 100));
    const avgQuizScore = quizList.length > 0 ? Math.round(totalScoreSum / quizList.length) : 0;

    let rank = 'Novice Developer';
    if (overallPercentage >= 100) rank = 'Full-Stack Master';
    else if (overallPercentage >= 75) rank = 'Senior Specialist';
    else if (overallPercentage >= 50) rank = 'Intermediate Specialist';
    else if (overallPercentage >= 25) rank = 'Junior Specialist';

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        slug: slugifyName(student.name),
        email: student.email,
        mobile: student.mobile || 'N/A',
        avatar: student.avatar || '',
        resumeUrl: student.resumeUrl || '',
        createdAt: student.createdAt,
        rank,
        metrics: {
          overallPercentage,
          completedLessonsCount,
          totalCourseLessons,
          assignmentsSubmittedCount: submissionsList.length,
          quizzesPassedCount: passedQuizCount,
          quizzesAttemptedCount: quizList.length,
          avgQuizScore,
        },
        weeks: weeksData,
      },
    });
  } catch (error) {
    console.error('Error fetching single student details for trainer:', error);
    res.status(500).json({ success: false, message: 'Server error loading student details', error: error.message });
  }
});

// @route   GET /api/trainer/assignments
// @desc    Get all 12 modules with project assignment details for editing
// @access  Private (Trainer/Admin only)
router.get('/assignments', protect, authorizeTrainer, async (req, res) => {
  try {
    const modules = await CourseModule.find().sort({ weekNumber: 1 });
    res.status(200).json({
      success: true,
      modules,
    });
  } catch (error) {
    console.error('Error fetching trainer assignments:', error);
    res.status(500).json({ success: false, message: 'Server error fetching assignments', error: error.message });
  }
});

// @route   PUT /api/trainer/assignment/:weekNumber
// @desc    Update assignment title, description, requirements, starter code & template repo for a week
// @access  Private (Trainer/Admin only)
router.put('/assignment/:weekNumber', protect, authorizeTrainer, async (req, res) => {
  try {
    const weekNumber = parseInt(req.params.weekNumber);
    const { title, description, requirements, starterRepoUrl, starterFileName, starterCode, points } = req.body;

    const moduleItem = await CourseModule.findOne({ weekNumber });
    if (!moduleItem) {
      return res.status(404).json({ success: false, message: `Course module for Week ${weekNumber} not found` });
    }

    if (!moduleItem.assignment) {
      moduleItem.assignment = {};
    }

    if (title !== undefined) moduleItem.assignment.title = title;
    if (description !== undefined) moduleItem.assignment.description = description;
    if (requirements !== undefined) {
      moduleItem.assignment.requirements = Array.isArray(requirements)
        ? requirements
        : (typeof requirements === 'string' ? requirements.split('\n').filter(r => r.trim()) : []);
    }
    if (starterRepoUrl !== undefined) moduleItem.assignment.starterRepoUrl = starterRepoUrl;
    if (starterFileName !== undefined) moduleItem.assignment.starterFileName = starterFileName;
    if (starterCode !== undefined) moduleItem.assignment.starterCode = starterCode;
    if (points !== undefined) moduleItem.assignment.points = parseInt(points) || 100;

    await moduleItem.save();

    res.status(200).json({
      success: true,
      message: `Successfully updated Week ${weekNumber} project assignment!`,
      assignment: moduleItem.assignment,
      module: moduleItem,
    });
  } catch (error) {
    console.error('Error updating trainer assignment:', error);
    res.status(500).json({ success: false, message: 'Server error updating assignment', error: error.message });
  }
});

// @route   GET /api/trainer/visitors
// @desc    Get IP visitor tracking logs & analytics metrics for students and guests
// @access  Private (Trainer/Admin only)
router.get('/visitors', protect, authorizeTrainer, async (req, res) => {
  try {
    const visitors = await Visitor.find().populate('user', 'name email role avatar').sort({ lastVisitedAt: -1 });

    const totalUniqueVisitors = visitors.length;
    const totalPageVisits = visitors.reduce((sum, v) => sum + (v.visitCount || 0), 0);

    const studentVisitorsCount = visitors.filter((v) => v.userRole === 'student' || (v.user && v.user.role === 'student')).length;
    const guestVisitorsCount = visitors.filter((v) => !v.userRole || v.userRole === 'guest').length;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeToday = visitors.filter((v) => new Date(v.lastVisitedAt) >= twentyFourHoursAgo).length;

    res.status(200).json({
      success: true,
      metrics: {
        totalUniqueVisitors,
        totalPageVisits,
        studentVisitorsCount,
        guestVisitorsCount,
        activeToday,
      },
      visitors,
    });
  } catch (error) {
    console.error('Error fetching visitor tracking logs:', error);
    res.status(500).json({ success: false, message: 'Server error fetching visitor list', error: error.message });
  }
});

// @route   DELETE /api/trainer/visitors/:id
// @desc    Remove a visitor IP log entry
// @access  Private (Trainer/Admin only)
router.delete('/visitors/:id', protect, authorizeTrainer, async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor record not found' });
    }
    res.status(200).json({ success: true, message: 'Visitor IP entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting visitor log', error: error.message });
  }
});

module.exports = router;
