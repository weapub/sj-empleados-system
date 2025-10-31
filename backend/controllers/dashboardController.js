const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Obtener todas las métricas para el dashboard
exports.getDashboardMetrics = async (req, res) => {
  try {
    // Obtener empleados activos
    const empleadosActivos = await Employee.countDocuments({ activo: true });
    
    // Calcular el primer día del mes actual
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Obtener inasistencias del mes actual
    const inasistenciasMes = await Attendance.countDocuments({
      date: { $gte: firstDayOfMonth }
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
    
    // Obtener empleados sin presentismo
    const sinPresentismo = await Attendance.countDocuments({
      lostPresentismo: true,
      date: { $gte: firstDayOfMonth }
    });
    
    // Total histórico de registros
    const totalHistorico = await Attendance.countDocuments();
    
    const metrics = {
      empleadosActivos,
      inasistenciasMes,
      justificadas,
      injustificadas,
      licenciasMedicas,
      vacaciones,
      sanciones,
      sinPresentismo,
      totalHistorico
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error al obtener métricas del dashboard:', error);
    res.status(500).json({ msg: 'Error del servidor al obtener métricas' });
  }
};