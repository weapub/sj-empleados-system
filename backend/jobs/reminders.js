const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const Disciplinary = require('../models/Disciplinary');
const Employee = require('../models/Employee');
const { sendWhatsApp } = require('../utils/whatsapp');
const EmployeeEvent = require('../models/EmployeeEvent');

// Configuración por entorno
const REMINDERS_CRON = process.env.REMINDERS_CRON || '0 8 * * *';
const REMINDERS_ONLY_ACTIVE = String(process.env.REMINDERS_ONLY_ACTIVE || 'true').toLowerCase() !== 'false';
const REMINDERS_DEPARTAMENTO = (process.env.REMINDERS_DEPARTAMENTO || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const REMINDERS_SUCURSAL = (process.env.REMINDERS_SUCURSAL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

async function notifyAndMark(attendance, kind, msg) {
  try {
    const employee = await Employee.findById(attendance.employee);
    if (employee && employee.telefono && matchesFilters(employee)) {
      await sendWhatsApp(employee.telefono, msg);
      // Registrar evento automático
      const ev = new EmployeeEvent({
        employee: attendance.employee,
        type: 'auto_whatsapp_reminder',
        message: msg,
        changes: [{ field: `attendance.${kind}`, from: false, to: true }]
      });
      await ev.save();
      // Marcar bandera correspondiente
      if (kind === 'certificateReminderSent') attendance.certificateReminderSent = true;
      if (kind === 'vacationStartReminderSent') attendance.vacationStartReminderSent = true;
      if (kind === 'returnToWorkReminderSent') attendance.returnToWorkReminderSent = true;
      attendance.updatedAt = Date.now();
      await attendance.save();
    }
  } catch (err) {
    console.error('Error en notificación automática:', err.message);
  }
}

async function notifyAndMarkDisciplinary(disciplinary, msg) {
  try {
    const employee = await Employee.findById(disciplinary.employee);
    if (employee && employee.telefono && matchesFilters(employee)) {
      await sendWhatsApp(employee.telefono, msg);
      const ev = new EmployeeEvent({
        employee: disciplinary.employee,
        type: 'auto_whatsapp_reminder',
        message: msg,
        changes: [{ field: 'disciplinary.returnToWorkReminderSent', from: false, to: true }]
      });
      await ev.save();
      disciplinary.returnToWorkReminderSent = true;
      disciplinary.updatedAt = Date.now();
      await disciplinary.save();
    }
  } catch (err) {
    console.error('Error en notificación automática (disciplinary):', err.message);
  }
}

async function runDailyReminders() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // Certificados médicos que vencen hoy o mañana
  const certs = await Attendance.find({
    type: 'licencia medica',
    certificateExpiry: { $ne: null },
    certificateReminderSent: false
  }).exec();
  for (const att of certs) {
    const expiry = new Date(att.certificateExpiry);
    if (isSameDay(expiry, today) || isSameDay(expiry, tomorrow)) {
      const msg = `Recordatorio: tu certificado médico vence ${expiry.toLocaleDateString('es-AR')}. Enviar actualización si corresponde.`;
      await notifyAndMark(att, 'certificateReminderSent', msg);
    }
  }

  // Inicio de vacaciones hoy
  const vacStartList = await Attendance.find({ type: 'vacaciones', vacationsStart: { $ne: null }, vacationStartReminderSent: false }).exec();
  for (const att of vacStartList) {
    const start = new Date(att.vacationsStart);
    if (isSameDay(start, today)) {
      const msg = `¡Felices vacaciones! Inicio: ${start.toLocaleDateString('es-AR')}. Disfruta y recuerda tu regreso.`;
      await notifyAndMark(att, 'vacationStartReminderSent', msg);
    }
  }

  // Reincorporación hoy (por vacaciones o suspensión)
  const returnList = await Attendance.find({ returnToWorkDate: { $ne: null }, returnToWorkReminderSent: false }).exec();
  for (const att of returnList) {
    const ret = new Date(att.returnToWorkDate);
    if (isSameDay(ret, today)) {
      const msg = `Recordatorio: Presentarse a trabajar hoy (${ret.toLocaleDateString('es-AR')}).`;
      await notifyAndMark(att, 'returnToWorkReminderSent', msg);
    }
  }

  // Reincorporación hoy por medida disciplinaria
  const discReturnList = await Disciplinary.find({ returnToWorkDate: { $ne: null }, returnToWorkReminderSent: false }).exec();
  for (const disc of discReturnList) {
    const ret = new Date(disc.returnToWorkDate);
    if (isSameDay(ret, today)) {
      const msg = `Recordatorio: Reincorporación hoy por sanción (${ret.toLocaleDateString('es-AR')}).`;
      await notifyAndMarkDisciplinary(disc, msg);
    }
  }
}

function start() {
  // Ejecutar según cron configurado
  cron.schedule(REMINDERS_CRON, async () => {
    console.log('[CRON] Ejecutando recordatorios automáticos');
    await runDailyReminders();
  });
  console.log(
    '[CRON] Scheduler de recordatorios iniciado',
    JSON.stringify({
      cron: REMINDERS_CRON,
      onlyActive: REMINDERS_ONLY_ACTIVE,
      departamento: REMINDERS_DEPARTAMENTO,
      sucursal: REMINDERS_SUCURSAL,
    })
  );
}

module.exports = { start };

// Helpers
function matchesFilters(employee) {
  if (!employee) return false;
  if (REMINDERS_ONLY_ACTIVE && employee.activo === false) return false;
  if (REMINDERS_DEPARTAMENTO.length > 0) {
    const dept = (employee.departamento || '').trim();
    if (!REMINDERS_DEPARTAMENTO.includes(dept)) return false;
  }
  if (REMINDERS_SUCURSAL.length > 0) {
    const suc = (employee.sucursal || '').trim();
    if (!REMINDERS_SUCURSAL.includes(suc)) return false;
  }
  return true;
}