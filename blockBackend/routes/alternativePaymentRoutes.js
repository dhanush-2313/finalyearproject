const express = require('express');
const router = express.Router();
const alternativePaymentController = require('../controllers/alternativePaymentController');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new payment
router.post('/', authenticate, alternativePaymentController.createPayment);

// Get all payments (admin only)
router.get('/', authenticate, authorize(['admin']), alternativePaymentController.getPayments);

// Get a specific payment
router.get('/:id', authenticate, alternativePaymentController.getPaymentById);

// Update payment status (admin only)
router.patch('/:id/status', authenticate, authorize(['admin']), alternativePaymentController.updatePaymentStatus);

// Redeem a voucher
router.post('/redeem', authenticate, alternativePaymentController.redeemVoucher);

module.exports = router; 