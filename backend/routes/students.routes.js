const express = require('express');
const {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deactivateStudent,
} = require('../controllers/students.controller');
const { importStudents, exportStudents } = require('../controllers/studentTransfer.controller');
const { excelUpload } = require('../config/upload');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN } = require('../utils/access');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles(ROLE_ADMIN));

router.get('/', listStudents);
router.get('/export.xlsx', exportStudents);
router.post('/import', excelUpload.single('file'), importStudents);
router.post('/', createStudent);
router.get('/:id', getStudent);
router.put('/:id', updateStudent);
router.patch('/:id/deactivate', deactivateStudent);

module.exports = router;
