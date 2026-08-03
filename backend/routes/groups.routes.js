const express = require('express');
const {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  listGroupStudents,
} = require('../controllers/groups.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN, ROLE_TEACHER } = require('../utils/access');

const router = express.Router();
router.use(authenticate);

router.get('/', listGroups);
router.post('/', authorizeRoles(ROLE_ADMIN), createGroup);
router.get('/:id/students', authorizeRoles(ROLE_ADMIN, ROLE_TEACHER), listGroupStudents);
router.get('/:id', getGroup);
router.put('/:id', authorizeRoles(ROLE_ADMIN), updateGroup);
router.delete('/:id', authorizeRoles(ROLE_ADMIN), deleteGroup);

module.exports = router;
