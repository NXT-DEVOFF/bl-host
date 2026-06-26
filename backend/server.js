require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const db = require('./models');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const statsRoutes = require('./routes/stats');
const { authenticateToken } = require('./middleware/auth');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', authenticateToken, serverRoutes);
app.use('/api/stats', authenticateToken, statsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' },
  });
});

// Error handler
app.use(errorHandler);

// Database sync and server start
// `alter: true` ajoute automatiquement les nouvelles colonnes (ex: container_id)
// aux bases existantes lors d'une mise à jour, sans perdre les données.
db.sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    logger.info(`BL-Host API running on port ${PORT}`);
  });
}).catch(error => {
  logger.error('Database connection failed', { error: error.message });
  process.exit(1);
});