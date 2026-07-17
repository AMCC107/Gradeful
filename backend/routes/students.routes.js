const express = require('express');
const {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deactivateStudent,
} = require('../controllers/students.controller');

const router = express.Router();

router.get('/', listStudents);
router.post('/', createStudent);
router.get('/:id', getStudent);
router.put('/:id', updateStudent);
router.patch('/:id/deactivate', deactivateStudent);

module.exports = router;
