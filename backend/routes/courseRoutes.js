const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a course
router.post('/', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const course = await newCourse.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
