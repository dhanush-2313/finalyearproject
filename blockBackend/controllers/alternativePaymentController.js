const AlternativePayment = require('../models/AlternativePayment');
const { validatePayment, validateVoucherRedeem } = require('../validators/paymentValidator');
const { generateVoucherCode } = require('../utils/voucherUtils');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { error } = validatePayment(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const payment = new AlternativePayment({
      ...req.body,
      user: req.user._id,
      status: 'pending'
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Get all payments (admin only)
exports.getPayments = async (req, res) => {
  try {
    const payments = await AlternativePayment.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Get a specific payment
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await AlternativePayment.findById(req.params.id)
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user is authorized to view this payment
    if (payment.user._id.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Not authorized to view this payment' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

// Update payment status (admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const payment = await AlternativePayment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = status;
    if (status === 'approved') {
      payment.voucherCode = generateVoucherCode();
    }

    await payment.save();
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

// Redeem a voucher
exports.redeemVoucher = async (req, res) => {
  try {
    const { error } = validateVoucherRedeem(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { voucherCode } = req.body;
    const payment = await AlternativePayment.findOne({ voucherCode });

    if (!payment) {
      return res.status(404).json({ error: 'Invalid voucher code' });
    }

    if (payment.status !== 'approved') {
      return res.status(400).json({ error: 'Voucher not approved' });
    }

    if (payment.redeemed) {
      return res.status(400).json({ error: 'Voucher already redeemed' });
    }

    payment.redeemed = true;
    payment.redeemedAt = new Date();
    await payment.save();

    res.json({ message: 'Voucher redeemed successfully', payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to redeem voucher' });
  }
}; 