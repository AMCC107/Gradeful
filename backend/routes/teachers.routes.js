const express = require('express');
const {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deactivateTeacher,
} = require('../controllers/teachers.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN } = require('../utils/access');

const router = express.Router();
router.use(authenticate);
router.use(authorizeRoles(ROLE_ADMIN));

router.get('/', listTeachers);
router.post('/', createTeacher);
router.get('/:id', getTeacher);
router.put('/:id', updateTeacher);
router.patch('/:id/deactivate', deactivateTeacher);

module.exports = router;
