const express = require('express');
const QuizResult = require('../models/QuizResult');
const CourseModule = require('../models/CourseModule');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/quizzes/:moduleId
// @desc    Fetch quiz questions for a module (without leaking correct answers) & student result
// @access  Private
router.get('/:moduleId', protect, async (req, res) => {
  try {
    let moduleId = req.params.moduleId;

    if (!moduleId.match(/^[0-9a-fA-F]{24}$/)) {
      const mod = await CourseModule.findOne({ weekNumber: parseInt(moduleId) });
      if (!mod) {
        return res.status(404).json({ success: false, message: 'Module not found' });
      }
      moduleId = mod._id;
    }

    const moduleItem = await CourseModule.findById(moduleId);
    if (!moduleItem || !moduleItem.quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for this module' });
    }

    // Strip out correctAnswer from public questions payload
    const safeQuestions = moduleItem.quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      codeSnippet: q.codeSnippet,
      type: q.type,
      options: q.options,
    }));

    const result = await QuizResult.findOne({ user: req.user.id, module: moduleId });

    return res.status(200).json({
      success: true,
      quiz: {
        title: moduleItem.quiz.title,
        passingScore: moduleItem.quiz.passingScore || 70,
        questions: safeQuestions,
      },
      userResult: result || null,
    });
  } catch (error) {
    console.error('Fetch quiz error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
  }
});

// @route   POST /api/quizzes/submit
// @desc    Evaluate quiz answers, store attempt, and return score & detailed explanation feedback
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { moduleId, answers } = req.body; // answers: { [questionId]: selectedOptionIndex }

    if (!moduleId || !answers) {
      return res.status(400).json({ success: false, message: 'moduleId and answers object are required' });
    }

    const moduleItem = await CourseModule.findById(moduleId);
    if (!moduleItem || !moduleItem.quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found for this module' });
    }

    const questions = moduleItem.quiz.questions;
    let correctCount = 0;
    const evaluatedAnswers = [];

    questions.forEach((q) => {
      const selectedOpt = answers[q.id];
      const isCorrect = selectedOpt === q.correctAnswer;
      if (isCorrect) {
        correctCount += 1;
      }

      evaluatedAnswers.push({
        questionId: q.id,
        question: q.question,
        codeSnippet: q.codeSnippet,
        options: q.options,
        selectedOption: selectedOpt,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passingScore = moduleItem.quiz.passingScore || 70;
    const passed = score >= passingScore;

    // Save or update QuizResult
    let quizResult = await QuizResult.findOne({ user: req.user.id, module: moduleId });

    if (!quizResult) {
      quizResult = new QuizResult({
        user: req.user.id,
        module: moduleId,
        score,
        passed,
        answers: evaluatedAnswers.map((a) => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          isCorrect: a.isCorrect,
        })),
        completedAt: Date.now(),
      });
    } else {
      // Keep best score if student retakes
      if (score > quizResult.score || !quizResult.passed) {
        quizResult.score = Math.max(score, quizResult.score);
        quizResult.passed = quizResult.passed || passed;
        quizResult.answers = evaluatedAnswers.map((a) => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          isCorrect: a.isCorrect,
        }));
        quizResult.completedAt = Date.now();
      }
    }

    await quizResult.save();

    return res.status(200).json({
      success: true,
      score,
      passed,
      passingScore,
      correctCount,
      totalQuestions,
      feedback: evaluatedAnswers,
      userResult: quizResult,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit quiz', error: error.message });
  }
});

module.exports = router;
