const express = require('express');
const {
  listEnrollments,
  createEnrollment,
  deleteEnrollment,
} = require('../controllers/enrollments.controller');

const router = express.Router();

router.get('/', listEnrollments);
router.post('/', createEnrollment);
router.delete('/:id', deleteEnrollment);

module.exports = router;
