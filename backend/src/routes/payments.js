const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, mockComplete, getMyPayments } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/mock-complete', mockComplete);
router.get('/my', getMyPayments);

module.exports = router;
