const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Ruta para obtener todas las métricas del dashboard
// GET api/dashboard/metrics
router.get('/metrics', auth, dashboardController.getDashboardMetrics);

module.exports = router;