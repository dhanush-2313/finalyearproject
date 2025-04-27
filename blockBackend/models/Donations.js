const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: String, required: true },
  cause: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'confirmed'], 
    default: 'pending' 
  },
  message: { type: String, default: '' },
  paymentMethod: { type: String, default: 'crypto' },
  transactionHash: { type: String },
  error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);