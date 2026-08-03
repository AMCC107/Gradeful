const express = require('express');
const { listChildren, linkChild } = require('../controllers/parents.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN, ROLE_PARENT } = require('../utils/access');

const router = express.Router();
router.use(authenticate);
router.get('/students', authorizeRoles(ROLE_ADMIN, ROLE_PARENT), listChildren);
router.post('/students', authorizeRoles(ROLE_ADMIN), linkChild);

module.exports = router;
