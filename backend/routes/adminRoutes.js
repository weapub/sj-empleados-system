const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Endpoint de mantenimiento: migrar formatos en recursos raw de Cloudinary
router.post('/migrate/raw-formats', auth, adminController.migrateRawFormats);

module.exports = router;