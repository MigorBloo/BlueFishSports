const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const logger = require('./config/logger');
const { upload } = require('./services/s3Service');

// Import routes
const authRoutes = require('./routes/authRoutes');
const nflDraftRoutes = require('./routes/nflDraftRoutes');
const nbaDraftRoutes = require('./routes/nbaDraftRoutes');
const tennisRoutes = require('./routes/tennis');

// Import production config
const productionConfig = require('./config/production');

const app = express();
// Trust proxy for CloudFront
app.set('trust proxy', 1);

// Always apply CORS for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Apply production middleware
if (process.env.NODE_ENV === 'production') {
  // Security middleware
  app.use(helmet(productionConfig.security.helmet));
  app.use(cors(productionConfig.security.cors));
  app.use(rateLimit(productionConfig.security.rateLimit));

  // Stricter rate limiting for authentication endpoints
  const authRateLimit = rateLimit(productionConfig.security.authRateLimit);
  app.use('/api/auth/login', authRateLimit);
  app.use('/api/auth/register', authRateLimit);

  // Performance middleware
  if (productionConfig.performance.compression) {
    app.use(compression());
  }

  // Logging middleware
  app.use(morgan('combined', { stream: logger.stream }));
} else {
  // Development middleware
  app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }));
  app.use(morgan('dev'));
}

// Body parsing middleware - MOVED BEFORE REQUEST LOGGING
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging - MOVED AFTER BODY PARSING
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  next();
});

// File upload middleware - removed since it's now handled in the routes
// app.use(upload.single('profileLogo'));

// Initialize database (make it optional)
const pool = require('./config/database');
pool.connect()
  .then(client => {
    console.log('Database connection established successfully.');
    client.release();
  })
  .catch(err => {
    console.warn('Warning: Unable to connect to the database:', err.message);
    console.warn('The application will continue to run, but database features will not be available.');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/nfl-draft', nflDraftRoutes);
app.use('/api/nba-draft', nbaDraftRoutes);
app.use('/api/tennis', tennisRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BlueFish Sports Platform API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 