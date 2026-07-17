const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { authenticate, checkPermission } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', checkPermission('ver_perfil'), getProfile);
router.put('/', checkPermission('editar_perfil'), updateProfile);

module.exports = router;
