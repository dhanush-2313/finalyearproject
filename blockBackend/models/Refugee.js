const mongoose = require('mongoose');

const refugeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 0 }, // Ensure age is non-negative
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  location: { type: String, required: true },
  needs: { type: [String], required: true, validate: [array => array.length > 0, 'At least one need is required'] }, // Ensure at least one need
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Refugee', refugeeSchema);
