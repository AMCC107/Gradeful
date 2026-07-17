const express = require('express');
const {
  createUser,
  listUsers,
  updateUser,
  deactivateUser,
} = require('../controllers/users.controller');

const router = express.Router();

router.post('/', createUser);
router.get('/', listUsers);
router.put('/:id', updateUser);
router.patch('/:id/deactivate', deactivateUser);

module.exports = router;
