const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize, syncDatabase } = require('./models');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    service: 'ShortStay API'
  });
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const { Property } = require('./models');
    const count = await Property.count();
    res.json({ 
      success: true, 
      message: 'API is working',
      propertyCount: count 
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database error',
      error: error.message 
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  
  const statusCode = err.status || 500;
  const message = err.message || 'Something went wrong!';
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? {
      name: err.name,
      message: err.message,
      stack: err.stack
    } : {}
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Sync database
    await syncDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`
🚀 ShortStay Backend Server Started!
📡 Port: ${PORT}
🌐 API URL: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/api/health
🧪 Test Endpoint: http://localhost:${PORT}/api/test
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();