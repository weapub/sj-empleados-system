const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');
const { handleUploadError } = require('../middleware/uploadErrorHandler');

// Rutas protegidas con autenticación
router.post('/', auth, handleUploadError(upload.single('justificationDocument')), attendanceController.createAttendance);
router.get('/', auth, attendanceController.getAllAttendances);
router.get('/employee/:employeeId', auth, attendanceController.getAttendancesByEmployee);
router.put('/:id', auth, handleUploadError(upload.single('justificationDocument')), attendanceController.updateAttendance);
router.delete('/:id', auth, attendanceController.deleteAttendance);
router.get('/stats', auth, attendanceController.getAttendanceStats);

module.exports = router;