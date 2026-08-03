const express = require('express');
const {
  listConcepts,
  createConcept,
  updateConcept,
  getAccount,
  createCharge,
  createPayment,
  submitPaymentProof,
} = require('../controllers/payments.controller');
const { paymentProofUpload } = require('../config/upload');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLE_ADMIN, ROLE_PARENT, ROLE_STUDENT } = require('../utils/access');

const router = express.Router();
router.use(authenticate);
router.get('/concepts', listConcepts);
router.post('/concepts', authorizeRoles(ROLE_ADMIN), createConcept);
router.put('/concepts/:id', authorizeRoles(ROLE_ADMIN), updateConcept);
router.get('/accounts/:studentId', authorizeRoles(ROLE_ADMIN, ROLE_PARENT, ROLE_STUDENT), getAccount);
router.post('/proofs', authorizeRoles(ROLE_ADMIN, ROLE_PARENT, ROLE_STUDENT), paymentProofUpload.single('document'), submitPaymentProof);
router.post('/charges', authorizeRoles(ROLE_ADMIN), createCharge);
router.post('/', authorizeRoles(ROLE_ADMIN), createPayment);

module.exports = router;
