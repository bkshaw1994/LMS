const express = require('express');
const Progress = require('../models/Progress');
const CourseModule = require('../models/CourseModule');
const Submission = require('../models/Submission');
const QuizResult = require('../models/QuizResult');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get progress, assignment submissions, and quiz results for logged-in student
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const [progressList, submissions, quizResults, allModules] = await Promise.all([
      Progress.find({ user: req.user.id }),
      Submission.find({ user: req.user.id }),
      QuizResult.find({ user: req.user.id }),
      CourseModule.find().sort({ weekNumber: 1 }),
    ]);

    let totalLessonsCount = 0;
    allModules.forEach(m => {
      totalLessonsCount += (m.lessons ? m.lessons.length : 0);
    });

    let completedLessonsCount = 0;
    progressList.forEach(p => {
      completedLessonsCount += (p.completedLessons ? p.completedLessons.length : 0);
    });

    const overallPercentage = totalLessonsCount > 0 
      ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
      : 0;

    return res.status(200).json({
      success: true,
      overallPercentage,
      totalLessonsCount,
      completedLessonsCount,
      data: progressList,
      submissions,
      quizResults,
    });
  } catch (error) {
    console.error('Fetch progress error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching progress', error: error.message });
  }
});

// @route   POST /api/progress/update
// @desc    Mark a lesson as complete / incomplete
// @access  Private
router.post('/update', protect, async (req, res) => {
  try {
    const { moduleId, lessonId, isCompleted } = req.body;

    if (!moduleId || !lessonId) {
      return res.status(400).json({ success: false, message: 'moduleId and lessonId are required' });
    }

    const moduleItem = await CourseModule.findById(moduleId);
    if (!moduleItem) {
      return res.status(404).json({ success: false, message: 'Course module not found' });
    }

    let progress = await Progress.findOne({ user: req.user.id, module: moduleId });

    if (!progress) {
      progress = new Progress({
        user: req.user.id,
        module: moduleId,
        completedLessons: [],
        isModuleCompleted: false,
      });
    }

    const lessonIdStr = lessonId.toString();
    const existingIndex = progress.completedLessons.findIndex(
      id => id.toString() === lessonIdStr
    );

    const shouldComplete = isCompleted !== undefined ? isCompleted : (existingIndex === -1);

    if (shouldComplete && existingIndex === -1) {
      progress.completedLessons.push(lessonId);
    } else if (!shouldComplete && existingIndex !== -1) {
      progress.completedLessons.splice(existingIndex, 1);
    }

    const totalModuleLessons = moduleItem.lessons.length;
    progress.isModuleCompleted = totalModuleLessons > 0 && progress.completedLessons.length >= totalModuleLessons;
    progress.updatedAt = Date.now();

    await progress.save();

    return res.status(200).json({
      success: true,
      message: shouldComplete ? 'Lesson marked as completed' : 'Lesson marked as incomplete',
      data: progress,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update lesson progress', error: error.message });
  }
});

module.exports = router;
