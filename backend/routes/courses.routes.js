const express = require('express');
const {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN } = require('../utils/access');

const router = express.Router();
router.use(authenticate);

router.get('/', listCourses);
router.post('/', authorizeRoles(ROLE_ADMIN), createCourse);
router.put('/:id', authorizeRoles(ROLE_ADMIN), updateCourse);
router.delete('/:id', authorizeRoles(ROLE_ADMIN), deleteCourse);

module.exports = router;
