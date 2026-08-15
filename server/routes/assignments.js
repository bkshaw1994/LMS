const express = require('express');
const Submission = require('../models/Submission');
const CourseModule = require('../models/CourseModule');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/assignments/submit
// @desc    Submit a GitHub repository URL for a weekly project assignment
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { moduleId, githubUrl, notes } = req.body;

    if (!moduleId || !githubUrl) {
      return res.status(400).json({ success: false, message: 'moduleId and githubUrl are required' });
    }

    // Validate GitHub URL format
    const githubRegex = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/;
    if (!githubRegex.test(githubUrl.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid GitHub URL. Must be in the format: https://github.com/username/repository' 
      });
    }

    // Verify module exists
    const moduleItem = await CourseModule.findById(moduleId);
    if (!moduleItem) {
      return res.status(404).json({ success: false, message: 'Course module not found' });
    }

    // Upsert submission
    let submission = await Submission.findOne({ user: req.user.id, module: moduleId });

    if (!submission) {
      submission = new Submission({
        user: req.user.id,
        module: moduleId,
        githubUrl: githubUrl.trim(),
        notes: notes || '',
        status: 'submitted',
        submittedAt: Date.now(),
      });
    } else {
      submission.githubUrl = githubUrl.trim();
      submission.notes = notes || submission.notes;
      submission.submittedAt = Date.now();
    }

    await submission.save();

    return res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully!',
      data: submission,
    });
  } catch (error) {
    console.error('Assignment submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit assignment', error: error.message });
  }
});

// @route   GET /api/assignments/:moduleId
// @desc    Get submission details for a specific module
// @access  Private
router.get('/:moduleId', protect, async (req, res) => {
  try {
    let moduleId = req.params.moduleId;

    // Check if moduleId is a weekNumber or ObjectId
    if (!moduleId.match(/^[0-9a-fA-F]{24}$/)) {
      const mod = await CourseModule.findOne({ weekNumber: parseInt(moduleId) });
      if (!mod) {
        return res.status(404).json({ success: false, message: 'Module not found' });
      }
      moduleId = mod._id;
    }

    const submission = await Submission.findOne({ user: req.user.id, module: moduleId });

    return res.status(200).json({
      success: true,
      data: submission || null,
    });
  } catch (error) {
    console.error('Fetch assignment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch assignment submission' });
  }
});

module.exports = router;
