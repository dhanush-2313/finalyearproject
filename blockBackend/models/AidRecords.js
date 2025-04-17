const mongoose = require('mongoose');

const aidRecordSchema = new mongoose.Schema({
  refugeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Refugee', required: true },
  fieldWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  dateProvided: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('AidRecord', aidRecordSchema);