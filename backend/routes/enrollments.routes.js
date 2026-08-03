const express = require('express');
const {
  listEnrollments,
  createEnrollment,
  deleteEnrollment,
} = require('../controllers/enrollments.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN } = require('../utils/access');

const router = express.Router();
router.use(authenticate);
router.use(authorizeRoles(ROLE_ADMIN));

router.get('/', listEnrollments);
router.post('/', createEnrollment);
router.delete('/:id', deleteEnrollment);

module.exports = router;
