const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const auth = require('../middleware/auth');

// Payroll receipts routes (protected)
router.post('/', auth, payrollController.createReceipt);
router.get('/', auth, payrollController.getAllReceipts);
router.get('/employee/:employeeId', auth, payrollController.getReceiptsByEmployee);
router.get('/employee/:employeeId/weekly', auth, payrollController.getWeeklyBreakdown);
router.get('/:id', auth, payrollController.getReceiptById);
router.put('/:id', auth, payrollController.updateReceipt);
router.delete('/:id', auth, payrollController.deleteReceipt);

module.exports = router;