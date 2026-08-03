const express = require('express');
const {
  listActivities,
  listPendingForStudent,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activities.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN, ROLE_STUDENT, ROLE_TEACHER } = require('../utils/access');

const router = express.Router();
router.use(authenticate);

router.get('/pending', authorizeRoles(ROLE_STUDENT), listPendingForStudent);
router.get('/', authorizeRoles(ROLE_ADMIN, ROLE_TEACHER), listActivities);
router.post('/', authorizeRoles(ROLE_ADMIN, ROLE_TEACHER), createActivity);
router.put('/:id', authorizeRoles(ROLE_ADMIN, ROLE_TEACHER), updateActivity);
router.delete('/:id', authorizeRoles(ROLE_ADMIN, ROLE_TEACHER), deleteActivity);

module.exports = router;
