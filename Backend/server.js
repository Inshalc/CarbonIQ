const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const emissionRoutes = require('./routes/emissions');
const externalRoutes = require('./routes/external');

// Import database connection
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: false, // Same origin since we're serving static files
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'carboniq-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/external', externalRoutes);

// API test endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'CarbonIQ API Running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      database_connected: isConnected,
      database: process.env.DB_NAME || 'carbon_footprint_db'
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Serve frontend routes - SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 CarbonIQ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  
  // Test database connection
  await testConnection();
});

module.exports = app;