const mongoose = require('mongoose');

const EmployeeAccountSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  weeklyDeductionAmount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeAccount', EmployeeAccountSchema);