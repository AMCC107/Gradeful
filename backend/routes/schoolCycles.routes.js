const express = require('express');
const {
  listSchoolCycles,
  createSchoolCycle,
  updateSchoolCycle,
  createPeriod,
} = require('../controllers/schoolCycles.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN } = require('../utils/access');

const router = express.Router();
router.use(authenticate);
router.get('/', listSchoolCycles);
router.post('/', authorizeRoles(ROLE_ADMIN), createSchoolCycle);
router.put('/:id', authorizeRoles(ROLE_ADMIN), updateSchoolCycle);
router.post('/:id/periods', authorizeRoles(ROLE_ADMIN), createPeriod);

module.exports = router;
