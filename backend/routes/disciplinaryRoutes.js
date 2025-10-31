const express = require('express');
const router = express.Router();
const disciplinaryController = require('../controllers/disciplinaryController');
const auth = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');
const { handleUploadError } = require('../middleware/uploadErrorHandler');

// Rutas protegidas con autenticación
router.post('/', auth, handleUploadError(upload.single('document')), disciplinaryController.createDisciplinary);
router.get('/', auth, disciplinaryController.getAllDisciplinaries);
router.get('/employee/:employeeId', auth, disciplinaryController.getDisciplinariesByEmployee);
router.get('/:id', auth, disciplinaryController.getDisciplinaryById);
router.put('/:id', auth, handleUploadError(upload.single('document')), disciplinaryController.updateDisciplinary);
router.delete('/:id', auth, disciplinaryController.deleteDisciplinary);

module.exports = router;