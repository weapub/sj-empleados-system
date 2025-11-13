const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['justificada', 'injustificada', 'licencia medica', 'vacaciones', 'sancion recibida', 'inasistencia', 'tardanza'],
    required: true
  },
  justified: {
    type: Boolean,
    default: false
  },
  justificationDocument: {
    type: String,
    default: null
  },
  lostPresentismo: {
    type: Boolean,
    default: true
  },
  scheduledEntry: {
    type: String, // formato HH:mm
    default: null
  },
  actualEntry: {
    type: String, // formato HH:mm
    default: null
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  // Campos para automatizar recordatorios
  certificateExpiry: {
    type: Date,
    default: null
  },
  vacationsStart: {
    type: Date,
    default: null
  },
  vacationsEnd: {
    type: Date,
    default: null
  },
  suspensionDays: {
    type: Number,
    default: null
  },
  returnToWorkDate: {
    type: Date,
    default: null
  },
  certificateReminderSent: {
    type: Boolean,
    default: false
  },
  vacationStartReminderSent: {
    type: Boolean,
    default: false
  },
  returnToWorkReminderSent: {
    type: Boolean,
    default: false
  },
  comments: {
    type: String,
    default: ''
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

// Índices para acelerar consultas frecuentes y conteos
AttendanceSchema.index({ type: 1, date: -1 });
AttendanceSchema.index({ lostPresentismo: 1, date: -1 });
AttendanceSchema.index({ employee: 1, date: -1 });
AttendanceSchema.index({ returnToWorkDate: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);