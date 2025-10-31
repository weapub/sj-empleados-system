const EmployeeEvent = require('../models/EmployeeEvent');

exports.createEvent = async (req, res) => {
  try {
    const { employeeId, type, message, changes } = req.body;
    if (!employeeId || !type || !message) {
      return res.status(400).json({ msg: 'Parámetros insuficientes' });
    }
    const event = new EmployeeEvent({ employee: employeeId, type, message, changes: changes || [] });
    await event.save();
    res.status(201).json({ msg: 'Evento registrado', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

exports.getEventsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const events = await EmployeeEvent.find({ employee: employeeId }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};