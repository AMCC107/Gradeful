const express = require('express');
const {
  listActivities,
  listPendingForStudent,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activities.controller');

const router = express.Router();

router.get('/pending', listPendingForStudent);
router.get('/', listActivities);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
