const express = require('express');
const {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deactivateTeacher,
} = require('../controllers/teachers.controller');

const router = express.Router();

router.get('/', listTeachers);
router.post('/', createTeacher);
router.get('/:id', getTeacher);
router.put('/:id', updateTeacher);
router.patch('/:id/deactivate', deactivateTeacher);

module.exports = router;
