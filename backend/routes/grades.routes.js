const express = require('express');
const { listGroupGrades, saveGroupGrades, getStudentGrades } = require('../controllers/grades.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN, ROLE_TEACHER } = require('../utils/access');

const router = express.Router();
router.use(authenticate);
router.get('/', listGroupGrades);
router.put('/group/:groupId', authorizeRoles(ROLE_ADMIN, ROLE_TEACHER), saveGroupGrades);
router.get('/student/:studentId', getStudentGrades);

module.exports = router;
