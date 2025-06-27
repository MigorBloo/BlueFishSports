const path = require('path');
const { Pool } = require('pg');

// Only load dotenv if we're not in production or if environment variables are not already set
if (process.env.NODE_ENV !== 'production' || !process.env.NBA_DB_HOST) {
  require('dotenv').config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`)
  });
}

// Debug logging
console.log('NBA Database Configuration:');
console.log('Host:', process.env.NBA_DB_HOST);
console.log('Port:', process.env.NBA_DB_PORT);
console.log('Database:', process.env.NBA_DB_NAME);
console.log('Username:', process.env.NBA_DB_USER);
console.log('Password:', process.env.NBA_DB_PASSWORD ? '***' : 'not set');

const pool = new Pool({
  host: process.env.NBA_DB_HOST || 'nfldraft-db.cj0amasyek81.eu-west-2.rds.amazonaws.com',
  port: process.env.NBA_DB_PORT || 5432,
  database: process.env.NBA_DB_NAME || 'nbadraft',
  user: process.env.NBA_DB_USER || 'postgres',
  password: process.env.NBA_DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for RDS SSL
  } : false, // Disable SSL for local development
  // Connection pool settings
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to be established
  maxUses: 7500, // Maximum number of times a connection can be used before being closed
  // Set timezone to US Eastern
  timezone: 'America/New_York'
});

// Log connection events with timestamps
pool.on('connect', () => {
  console.log(`[${new Date().toISOString()}] New client connected to the database`);
});

pool.on('error', (err, client) => {
  console.error(`[${new Date().toISOString()}] Unexpected error on idle client:`, err);
  // Attempt to reconnect
  setTimeout(() => {
    pool.connect()
      .then(client => {
        console.log(`[${new Date().toISOString()}] Successfully reconnected to the database`);
        client.release();
      })
      .catch(err => console.error(`[${new Date().toISOString()}] Reconnection failed:`, err));
  }, 5000);
});

// Test the connection with retry logic
const maxRetries = 3;
let retryCount = 0;

const testConnection = () => {
  pool.connect()
    .then(client => {
      console.log(`[${new Date().toISOString()}] Database connection has been established successfully.`);
      client.release();
    })
    .catch(err => {
      console.error(`[${new Date().toISOString()}] Unable to connect to the database:`, err);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`[${new Date().toISOString()}] Retrying connection (attempt ${retryCount}/${maxRetries})...`);
        setTimeout(testConnection, 5000);
      }
    });
};

testConnection();

console.log('NBA Database config:', pool.options.database);

module.exports = pool; 