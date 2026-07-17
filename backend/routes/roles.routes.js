const express = require('express');
const { listRoles, createRole, updateRole } = require('../controllers/roles.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.use(checkPermission('gestionar_roles'));

router.get('/', listRoles);
router.post('/', createRole);
router.put('/:id', updateRole);

module.exports = router;
