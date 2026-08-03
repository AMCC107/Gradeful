const express = require('express');
const {
  createUser,
  listUsers,
  updateUser,
  deactivateUser,
} = require('../controllers/users.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN } = require('../utils/access');

const router = express.Router();
router.use(authenticate);
router.use(authorizeRoles(ROLE_ADMIN));

router.post('/', createUser);
router.get('/', listUsers);
router.put('/:id', updateUser);
router.patch('/:id/deactivate', deactivateUser);

module.exports = router;
