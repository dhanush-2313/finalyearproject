const mongoose = require('mongoose');

const mongoose = require('mongoose');

const blockchainEventSchema = new mongoose.Schema({
  eventType: { type: String, required: true, enum: ['AidAdded', 'AidUpdated'] }, // Example event types
  transactionId: { type: String, required: true },
  payload: { type: Object, required: true },
  timestamp: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('BlockchainEvent', blockchainEventSchema);


models/User.js
javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'fieldWorker', 'donor', 'refugee'], required: true },
}, { timestamps: true });


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
models/AidRecord.js
javascript
const mongoose = require('mongoose');

const aidRecordSchema = new mongoose.Schema({
  refugeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Refugee', required: true },
  fieldWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  dateProvided: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('AidRecord', aidRecordSchema);
models/Donation.js
javascript
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  cause: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
models/Refugee.js
javascript
const mongoose = require('mongoose');

const refugeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  location: { type: String, required: true },
  needs: { type: [String], required: true }, 
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Refugee', refugeeSchema);
models/ActivityLog.js
javascript
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
