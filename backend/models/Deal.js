const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entrepreneur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startupName: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  equity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'],
    default: 'Due Diligence'
  },
  stage: {
    type: String,
    enum: ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C'],
    default: 'Seed'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Deal', dealSchema);