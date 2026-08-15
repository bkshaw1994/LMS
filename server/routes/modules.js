const express = require('express');
const CourseModule = require('../models/CourseModule');

const router = express.Router();

// @route   GET /api/modules
// @desc    Fetch all 12 weeks of curriculum modules
// @access  Public / Student
router.get('/', async (req, res) => {
  try {
    const modules = await CourseModule.find().sort({ weekNumber: 1 });
    return res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    console.error('Fetch modules error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course modules',
      error: error.message,
    });
  }
});

// @route   GET /api/modules/:id
// @desc    Fetch a single module by ID or week number
// @access  Public / Student
router.get('/:id', async (req, res) => {
  try {
    let moduleItem;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      moduleItem = await CourseModule.findById(req.params.id);
    } else {
      moduleItem = await CourseModule.findOne({ weekNumber: parseInt(req.params.id) });
    }

    if (!moduleItem) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    return res.status(200).json({
      success: true,
      data: moduleItem,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching module details' });
  }
});

module.exports = router;
