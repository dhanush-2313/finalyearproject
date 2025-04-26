const mongoose = require('mongoose');

const alternativePaymentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['VOUCHER', 'MOBILE_MONEY'],
    required: true
  },
  recipientId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'REDEEMED', 'EXPIRED'],
    default: 'PENDING'
  },
  details: {
    code: String, // For vouchers
    phoneNumber: String, // For mobile money
    provider: String, // For mobile money
    expiryDate: Date // For vouchers
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
alternativePaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AlternativePayment', alternativePaymentSchema); 