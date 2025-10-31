const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const accountController = require('../controllers/accountController');

// Ping for debug
router.get('/_ping', (req, res) => res.json({ ok: true, scope: 'account' }));

// Obtener cuenta y transacciones por empleado
router.get('/employee/:employeeId', auth, accountController.getAccountByEmployee);

// Actualizar deducción semanal
router.put('/employee/:employeeId/weekly-deduction', auth, accountController.updateWeeklyDeduction);

// Registrar compra
router.post('/purchase', auth, accountController.addPurchase);

// Registrar pago
router.post('/payment', auth, accountController.addPayment);

module.exports = router;