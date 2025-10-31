const mongoose = require('mongoose');

const PayrollReceiptSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  // Period in format YYYY-MM
  period: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  signed: {
    type: Boolean,
    default: false
  },
  signedDate: {
    type: Date,
    default: null
  },
  hasPresentismo: {
    type: Boolean,
    default: false
  },
  extraHours: {
    type: Number,
    default: 0
  },
  otherAdditions: {
    type: Number,
    default: 0
  },
  discounts: {
    type: Number,
    default: 0
  },
  advanceRequested: {
    type: Boolean,
    default: false
  },
  advanceDate: {
    type: Date,
    default: null
  },
  advanceAmount: {
    type: Number,
    default: 0
  },
  // Deducción aplicada desde cuenta corriente del empleado en este pago
  accountDeductionApplied: {
    type: Number,
    default: 0
  },
  // Net monthly amount entered manually; weekly is derived on frontend
  netAmount: {
    type: Number,
    required: true
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

module.exports = mongoose.model('PayrollReceipt', PayrollReceiptSchema);