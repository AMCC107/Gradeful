const express = require('express');
const {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  listGroupStudents,
} = require('../controllers/groups.controller');

const router = express.Router();

router.get('/', listGroups);
router.post('/', createGroup);
router.get('/:id/students', listGroupStudents);
router.get('/:id', getGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

module.exports = router;
