const express = require('express');
const {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjects.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN } = require('../utils/access');

const router = express.Router();
router.use(authenticate);

router.get('/', listSubjects);
router.post('/', authorizeRoles(ROLE_ADMIN), createSubject);
router.put('/:id', authorizeRoles(ROLE_ADMIN), updateSubject);
router.delete('/:id', authorizeRoles(ROLE_ADMIN), deleteSubject);

module.exports = router;
