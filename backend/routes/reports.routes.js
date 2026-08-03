const express = require('express');
const {
  listReport,
  exportReportExcel,
  exportReportPdf,
  reportCardPdf,
  getInstitutionSettings,
  updateInstitutionSettings,
  dashboardSummary,
} = require('../controllers/reports.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN } = require('../utils/access');

const router = express.Router();
router.use(authenticate);
router.get('/settings/institution', getInstitutionSettings);
router.put('/settings/institution', authorizeRoles(ROLE_ADMIN), updateInstitutionSettings);
router.get('/dashboard/summary', authorizeRoles(ROLE_ADMIN), dashboardSummary);
router.get('/report-card/:studentId.pdf', reportCardPdf);
router.get('/:type/export.xlsx', authorizeRoles(ROLE_ADMIN), exportReportExcel);
router.get('/:type/export.pdf', authorizeRoles(ROLE_ADMIN), exportReportPdf);
router.get('/:type', authorizeRoles(ROLE_ADMIN), listReport);

module.exports = router;
