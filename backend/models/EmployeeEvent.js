const mongoose = require('mongoose');

const employeeEventSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  changes: [
    {
      field: String,
      from: mongoose.Schema.Types.Mixed,
      to: mongoose.Schema.Types.Mixed,
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmployeeEvent', employeeEventSchema);