const express = require('express');
const {
  listGroupAttendance,
  saveGroupAttendance,
  listStudentAttendance,
  submitJustification,
  reviewJustification,
  downloadJustification,
} = require('../controllers/attendance.controller');
const { documentUpload } = require('../config/upload');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN, ROLE_PARENT, ROLE_STUDENT, ROLE_TEACHER } = require('../utils/access');

const router = express.Router();
router.use(authenticate);
router.get('/', listGroupAttendance);
router.put('/group/:groupId', authorizeRoles(ROLE_ADMIN, ROLE_TEACHER), saveGroupAttendance);
router.get('/student/:studentId', listStudentAttendance);
router.post('/:id/justification', authorizeRoles(ROLE_ADMIN, ROLE_PARENT, ROLE_STUDENT), documentUpload.single('document'), submitJustification);
router.patch('/justifications/:id', authorizeRoles(ROLE_ADMIN, ROLE_TEACHER), reviewJustification);
router.get('/justifications/:id/document', downloadJustification);

module.exports = router;
