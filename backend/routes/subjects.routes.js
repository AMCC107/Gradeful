const express = require('express');
const {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjects.controller');

const router = express.Router();

router.get('/', listSubjects);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

module.exports = router;
