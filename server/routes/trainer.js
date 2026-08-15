const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Submission = require('../models/Submission');
const QuizResult = require('../models/QuizResult');
const CourseModule = require('../models/CourseModule');
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
    modules.forEach((mod) => {
      const count = mod.lessons ? mod.lessons.length : 0;
      totalCourseLessons += count;
      moduleLessonCounts[mod._id.toString()] = {
        weekNumber: mod.weekNumber,
        title: mod.title,
        lessonCount: count,
      };
    });

    if (totalCourseLessons === 0) totalCourseLessons = 48;

    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });

    const studentDataPromises = students.map(async (student) => {
      const studentId = student._id;

      const [progressList, submissionsList, quizList] = await Promise.all([
        Progress.find({ userId: studentId }),
        Submission.find({ userId: studentId }),
        QuizResult.find({ userId: studentId }),
      ]);

      let completedLessonsCount = 0;
      const progressByWeek = {};

      progressList.forEach((p) => {
        const completedCount = p.completedLessons ? p.completedLessons.length : 0;
        completedLessonsCount += completedCount;

        const modInfo = moduleLessonCounts[p.moduleId.toString()];
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
        submissionsByWeek[sub.weekNumber] = {
          submissionUrl: sub.submissionUrl,
          submittedAt: sub.submittedAt,
        };
      });

      const quizzesByWeek = {};
      let totalPassedQuizzes = 0;
      let totalQuizScoreSum = 0;

      quizList.forEach((q) => {
        if (q.passed) totalPassedQuizzes++;
        totalQuizScoreSum += q.percentage || 0;
        quizzesByWeek[q.weekNumber] = {
          score: q.score,
          totalQuestions: q.totalQuestions,
          percentage: q.percentage,
          passed: q.passed,
          attemptedAt: q.attemptedAt,
        };
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
      Progress.find({ userId: studentId }),
      Submission.find({ userId: studentId }),
      QuizResult.find({ userId: studentId }),
    ]);

    let totalCourseLessons = 0;
    let completedLessonsCount = 0;

    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.moduleId.toString()] = p.completedLessons || [];
      completedLessonsCount += (p.completedLessons ? p.completedLessons.length : 0);
    });

    const submissionsMap = {};
    submissionsList.forEach((s) => {
      submissionsMap[s.weekNumber] = s;
    });

    const quizMap = {};
    let passedQuizCount = 0;
    let totalScoreSum = 0;
    quizList.forEach((q) => {
      quizMap[q.weekNumber] = q;
      if (q.passed) passedQuizCount++;
      totalScoreSum += (q.percentage || 0);
    });

    const weeksData = modules.map((mod) => {
      const lessonCount = mod.lessons ? mod.lessons.length : 0;
      totalCourseLessons += lessonCount;
      const completed = progressMap[mod._id.toString()] || [];
      const sub = submissionsMap[mod.weekNumber] || null;
      const quiz = quizMap[mod.weekNumber] || null;

      return {
        weekNumber: mod.weekNumber,
        title: mod.title,
        category: mod.category,
        totalLessons: lessonCount,
        lessons: mod.lessons || [],
        completedLessons: completed,
        completedCount: completed.length,
        isLessonsFinished: completed.length >= lessonCount && lessonCount > 0,
        submission: sub ? {
          submissionUrl: sub.submissionUrl,
          submittedAt: sub.submittedAt,
        } : null,
        quizResult: quiz ? {
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          percentage: quiz.percentage,
          passed: quiz.passed,
          attemptedAt: quiz.attemptedAt,
        } : null,
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

module.exports = router;
