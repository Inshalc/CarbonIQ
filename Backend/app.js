const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const emissionRoutes = require('./routes/emissions');
const externalRoutes = require('./routes/external');

// Import database connection test
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'carbon_tracker_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Carbon Footprint Tracker API',
    version: '1.0.0',
    database: 'carbon_footprint_db'
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  const isConnected = await testConnection();
  res.json({ database_connected: isConnected });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/external', externalRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${process.env.DB_NAME}`);
  await testConnection();
});

module.exports = app;