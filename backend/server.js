const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const statsRoutes = require('./routes/stats');
const { authenticateToken } = require('./middleware/auth');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', authenticateToken, serverRoutes);
app.use('/api/stats', authenticateToken, statsRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'BL-Host API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});