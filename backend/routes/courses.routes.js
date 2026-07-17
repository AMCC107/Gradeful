const express = require('express');
const {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses.controller');

const router = express.Router();

router.get('/', listCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
