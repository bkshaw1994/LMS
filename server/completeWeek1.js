require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const CourseModule = require('./models/CourseModule');
const Progress = require('./models/Progress');
const Submission = require('./models/Submission');
const QuizResult = require('./models/QuizResult');

async function markWeek1Complete() {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    const email = 'b.kumarshaw94@gmail.com';
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`User ${email} not found. Creating user...`);
      user = await User.create({
        name: 'B Kumar Shaw',
        email,
        password: 'Password123!',
        role: 'student',
      });
    }

    const week1Module = await CourseModule.findOne({ weekNumber: 1 });
    if (!week1Module) {
      console.error('Week 1 module not found.');
      process.exit(1);
    }

    // 1. Complete all Week 1 lessons in Progress
    const lessonIds = week1Module.lessons.map(l => l._id);
    let progress = await Progress.findOne({ user: user._id, module: week1Module._id });
    if (!progress) {
      progress = new Progress({
        user: user._id,
        module: week1Module._id,
        completedLessons: lessonIds,
        isModuleCompleted: true,
      });
    } else {
      progress.completedLessons = lessonIds;
      progress.isModuleCompleted = true;
    }
    await progress.save();
    console.log('✅ Marked all Week 1 lessons completed in Progress.');

    // 2. Submit GitHub Assignment for Week 1
    let submission = await Submission.findOne({ user: user._id, module: week1Module._id });
    if (!submission) {
      submission = new Submission({
        user: user._id,
        module: week1Module._id,
        githubUrl: 'https://github.com/bkumarshaw94/week1-vanilla-js-app',
        notes: 'Submitted Week 1 project assignment.',
        status: 'submitted',
        score: 100,
      });
    } else {
      submission.githubUrl = 'https://github.com/bkumarshaw94/week1-vanilla-js-app';
    }
    await submission.save();
    console.log('✅ Marked Week 1 GitHub Project Assignment submitted.');

    // 3. Mark Week 1 Quiz Passed
    const quizAnswers = week1Module.quiz.questions.map(q => ({
      questionId: q.id,
      selectedOption: q.correctAnswer,
      isCorrect: true,
    }));

    let quizResult = await QuizResult.findOne({ user: user._id, module: week1Module._id });
    if (!quizResult) {
      quizResult = new QuizResult({
        user: user._id,
        module: week1Module._id,
        score: 100,
        passed: true,
        answers: quizAnswers,
      });
    } else {
      quizResult.score = 100;
      quizResult.passed = true;
      quizResult.answers = quizAnswers;
    }
    await quizResult.save();
    console.log('✅ Marked Week 1 Knowledge Test passed (100%).');

    console.log(`🎉 Week 1 successfully marked 100% completed for user ${email}! Week 2 is now unlocked.`);
    process.exit(0);
  } catch (error) {
    console.error('Error marking Week 1 complete:', error);
    process.exit(1);
  }
}

markWeek1Complete();
