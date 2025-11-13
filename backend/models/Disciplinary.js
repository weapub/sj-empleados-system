const mongoose = require('mongoose');

const DisciplinarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Hora de la medida (HH:mm)
  time: {
    type: String,
    default: null,
    match: [/^\d{2}:\d{2}$/, 'Formato de hora inválido']
  },
  type: {
    type: String,
    enum: ['verbal', 'formal', 'grave'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  document: {
    type: String,
    default: null
  },
  signed: {
    type: Boolean,
    default: false
  },
  signedDate: {
    type: Date,
    default: null
  },
  durationDays: {
    type: Number,
    default: null
  },
  returnToWorkDate: {
    type: Date,
    default: null
  },
  returnToWorkReminderSent: {
    type: Boolean,
    default: false
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

// Índices para acelerar filtros y conteos
DisciplinarySchema.index({ type: 1, date: -1 });
DisciplinarySchema.index({ employee: 1, date: -1 });
DisciplinarySchema.index({ signed: 1 });
DisciplinarySchema.index({ durationDays: 1, returnToWorkDate: 1 });

module.exports = mongoose.model('Disciplinary', DisciplinarySchema);