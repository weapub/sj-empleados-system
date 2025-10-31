require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const disciplinaryRoutes = require('./routes/disciplinaryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const eventRoutes = require('./routes/eventRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const accountRoutes = require('./routes/accountRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reminders = require('./jobs/reminders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/disciplinary', disciplinaryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payroll', payrollRoutes);
console.log('[Routes] Mounting account routes:', !!accountRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);

// Debug: list registered routes
app.get('/api/_debug/routes', (req, res) => {
  try {
    const routes = [];
    app?._router?.stack?.forEach((middleware) => {
      if (middleware?.route) {
        const methods = Object.keys(middleware.route.methods || {}).join(',');
        routes.push(`${methods} ${middleware.route.path}`);
      } else if (middleware?.name === 'router' && middleware?.handle?.stack) {
        middleware.handle.stack.forEach((handler) => {
          if (handler?.route) {
            const methods = Object.keys(handler.route.methods || {}).join(',');
            routes.push(`[router] ${methods} ${handler.route.path}`);
          }
        });
      }
    });
    res.json({ routes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DB Connection con fallback en memoria para desarrollo
async function startServer() {
  const port = process.env.PORT || 5000;
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/empleados_db';
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`[DB] Conectado a MongoDB: ${mongoUri}`);
  } catch (err) {
    console.error('[DB] Error conectando a MongoDB local:', err.message);
    console.log('[DB] Iniciando MongoDB en memoria (solo desarrollo)');
    const memServer = await MongoMemoryServer.create();
    const memUri = memServer.getUri();
    await mongoose.connect(memUri);
    console.log(`[DB] Conectado a MongoDB en memoria: ${memUri}`);
  }
  // Iniciar cron y servidor
  reminders.start();
  app.listen(port, () => {
    console.log(`[API] Servidor escuchando en puerto ${port}`);
  });
}

startServer();