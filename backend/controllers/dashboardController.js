const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Disciplinary = require('../models/Disciplinary');
const PayrollReceipt = require('../models/PayrollReceipt');

// Obtener todas las métricas para el dashboard
exports.getDashboardMetrics = async (req, res) => {
  try {
    // Obtener empleados activos
    const empleadosActivos = await Employee.countDocuments({ activo: true });
    
    // Calcular referencias de fecha (mes actual y anterior)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
    
    // Inasistencias del mes (type: 'inasistencia') y mes anterior
    const inasistenciasMes = await Attendance.countDocuments({
      type: 'inasistencia',
      date: { $gte: firstDayOfMonth }
    });
    const inasistenciasPrev = await Attendance.countDocuments({
      type: 'inasistencia',
      date: { $gte: firstDayPrevMonth, $lte: endPrevMonth }
    });

    // Tardanzas del mes (type: 'tardanza') y mes anterior
    const tardanzasMes = await Attendance.countDocuments({
      type: 'tardanza',
      date: { $gte: firstDayOfMonth }
    });
    const tardanzasPrev = await Attendance.countDocuments({
      type: 'tardanza',
      date: { $gte: firstDayPrevMonth, $lte: endPrevMonth }
    });
    
    // Obtener inasistencias por tipo
    const justificadas = await Attendance.countDocuments({ 
      type: 'justificada',
      date: { $gte: firstDayOfMonth }
    });
    
    const injustificadas = await Attendance.countDocuments({ 
      type: 'injustificada',
      date: { $gte: firstDayOfMonth }
    });
    
    const licenciasMedicas = await Attendance.countDocuments({ 
      type: 'licencia medica',
      date: { $gte: firstDayOfMonth }
    });
    
    const vacaciones = await Attendance.countDocuments({ 
      type: 'vacaciones',
      date: { $gte: firstDayOfMonth }
    });

    const sanciones = await Attendance.countDocuments({ 
      type: 'sancion recibida',
      date: { $gte: firstDayOfMonth }
    });
    
    // Empleados sin presentismo (distintos en el mes)
    const sinPresentismoDistinct = await Attendance.distinct('employee', {
      lostPresentismo: true,
      date: { $gte: firstDayOfMonth }
    });
    const sinPresentismo = sinPresentismoDistinct.length;
    const sinPresentismoPrevDistinct = await Attendance.distinct('employee', {
      lostPresentismo: true,
      date: { $gte: firstDayPrevMonth, $lte: endPrevMonth }
    });
    const sinPresentismoPrev = sinPresentismoPrevDistinct.length;
    
    // Total histórico disciplinario
    const totalHistorico = await Disciplinary.countDocuments();
    
    // Apercibimientos (mes actual): medidas disciplinarias de tipo 'verbal' o 'formal'
    const apercibimientos = await Disciplinary.countDocuments({
      type: { $in: ['verbal', 'formal'] },
      date: { $gte: firstDayOfMonth }
    });
    const apercibimientosPrev = await Disciplinary.countDocuments({
      type: { $in: ['verbal', 'formal'] },
      date: { $gte: firstDayPrevMonth, $lte: endPrevMonth }
    });

    // Sanciones activas: medidas disciplinarias con suspensión vigente
    const sancionesActivas = await Disciplinary.countDocuments({
      durationDays: { $ne: null },
      returnToWorkDate: { $ne: null, $gte: today }
    });
    // Aproximación: activas al cierre del mes anterior
    const sancionesActivasPrev = await Disciplinary.countDocuments({
      durationDays: { $ne: null },
      returnToWorkDate: { $ne: null, $gte: endPrevMonth }
    });

    // Recibos pendientes: periodo actual y previo (no firmados)
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const currentPeriod = `${yyyy}-${mm}`;
    const prevY = endPrevMonth.getFullYear();
    const prevM = String(endPrevMonth.getMonth() + 1).padStart(2, '0');
    const prevPeriod = `${prevY}-${prevM}`;
    const recibosPendientes = await PayrollReceipt.countDocuments({ signed: false, period: currentPeriod });
    const recibosPendientesPrev = await PayrollReceipt.countDocuments({ signed: false, period: prevPeriod });

    // Calcular deltas (variación porcentual mes a mes donde aplica)
    const deltaPercent = (curr, prev) => {
      if (prev > 0) {
        const diff = curr - prev;
        const pct = Math.round((diff / prev) * 100);
        const sign = pct >= 0 ? '+' : '';
        return `${sign}${pct}%`;
      }
      return null;
    };

    const metrics = {
      empleadosActivos,
      inasistenciasMes,
      tardanzasMes,
      justificadas,
      injustificadas,
      licenciasMedicas,
      vacaciones,
      sanciones,
      sinPresentismo,
      totalHistorico,
      apercibimientos,
      sancionesActivas,
      recibosPendientes,
      deltas: {
        inasistenciasMes: deltaPercent(inasistenciasMes, inasistenciasPrev),
        tardanzasMes: deltaPercent(tardanzasMes, tardanzasPrev),
        sinPresentismo: deltaPercent(sinPresentismo, sinPresentismoPrev),
        apercibimientos: deltaPercent(apercibimientos, apercibimientosPrev),
        sancionesActivas: deltaPercent(sancionesActivas, sancionesActivasPrev),
        recibosPendientes: deltaPercent(recibosPendientes, recibosPendientesPrev)
      }
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error al obtener métricas del dashboard:', error);
    res.status(500).json({ msg: 'Error del servidor al obtener métricas' });
  }
};