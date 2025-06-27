module.exports = {
  // Security settings
  security: {
    cors: {
      origin: process.env.FRONTEND_URL.split(',').map(url => url.trim()),
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // limit each IP to 500 requests per windowMs (increased from 100)
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    authRateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 auth attempts per 15 minutes
      message: 'Too many authentication attempts, please try again later.',
      skipSuccessfulRequests: true,
      skipFailedRequests: false
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", ...process.env.FRONTEND_URL.split(',').map(url => url.trim())]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      frameguard: {
        action: 'deny'
      }
    }
  },

  // Logging settings
  logging: {
    level: 'info',
    format: 'combined',
    transports: ['console', 'file'],
    file: {
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }
  },

  // Performance settings
  performance: {
    compression: true,
    cacheControl: true,
    etag: true
  },

  // Error handling
  errorHandling: {
    showStack: false,
    showMessage: true
  }
}; 