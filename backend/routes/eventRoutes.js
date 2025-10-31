const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const eventController = require('../controllers/eventController');

// Registrar evento
router.post('/', auth, eventController.createEvent);

// Listar eventos por empleado
router.get('/employee/:employeeId', auth, eventController.getEventsByEmployee);

module.exports = router;