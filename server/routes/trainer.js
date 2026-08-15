const express = require('express');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Submission = require('../models/Submission');
const QuizResult = require('../models/QuizResult');
const CourseModule = require('../models/CourseModule');
const { protect } = require('../middleware/auth');

const router = express.Router();

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
    // 1. Fetch total available course modules and calculate total course lessons
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

    if (totalCourseLessons === 0) totalCourseLessons = 48; // fallback standard count

    // 2. Fetch all student users
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });

    // 3. For each student, aggregate progress, submissions, and quiz results
    const studentDataPromises = students.map(async (student) => {
      const studentId = student._id;

      const [progressList, submissionsList, quizList] = await Promise.all([
        Progress.find({ userId: studentId }),
        Submission.find({ userId: studentId }),
        QuizResult.find({ userId: studentId }),
      ]);

      // Calculate total completed lessons count across modules
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

      // Calculate overall completion percentage
      const overallPercentage = Math.min(100, Math.round((completedLessonsCount / totalCourseLessons) * 100));

      // Aggregate submissions
      const submissionsByWeek = {};
      submissionsList.forEach((sub) => {
        submissionsByWeek[sub.weekNumber] = {
          submissionUrl: sub.submissionUrl,
          submittedAt: sub.submittedAt,
        };
      });

      // Aggregate quizzes
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

      // Determine Student Status Rank Badge
      let rank = 'Novice Developer';
      if (overallPercentage >= 100) rank = 'Full-Stack Master';
      else if (overallPercentage >= 75) rank = 'Senior Specialist';
      else if (overallPercentage >= 50) rank = 'Intermediate Specialist';
      else if (overallPercentage >= 25) rank = 'Junior Specialist';

      return {
        id: student._id,
        name: student.name,
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

    // 4. Calculate Executive Cohort Summary
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

module.exports = router;
