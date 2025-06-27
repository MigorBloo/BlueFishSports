const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`)
});

// Debug logging
console.log('NFL Database Configuration:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('Username:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '***' : 'not set');

if (!process.env.DB_PASSWORD) {
  console.error('DB_PASSWORD is not set in environment variables');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST || 'nfldraft-db.cj0amasyek81.eu-west-2.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'nfldraft',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for RDS SSL
  } : false, // Disable SSL for local development
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait for a connection to be established (10 seconds)
  maxUses: 7500, // Maximum number of times a connection can be used before being closed
  // Set timezone to US Eastern
  timezone: 'America/New_York'
});

// Log connection events with timestamps
pool.on('connect', () => {
  console.log(`[${new Date().toISOString()}] New client connected to the NFL database`);
});

pool.on('error', (err, client) => {
  console.error(`[${new Date().toISOString()}] Unexpected error on idle NFL client:`, err);
  // Attempt to reconnect
  setTimeout(() => {
    pool.connect()
      .then(client => {
        console.log(`[${new Date().toISOString()}] Successfully reconnected to the NFL database`);
        client.release();
      })
      .catch(err => console.error(`[${new Date().toISOString()}] NFL reconnection failed:`, err));
  }, 5000);
});

// Test the connection with retry logic
const maxRetries = 3;
let retryCount = 0;

const testConnection = () => {
  pool.connect()
    .then(client => {
      console.log(`[${new Date().toISOString()}] NFL database connection has been established successfully.`);
      client.release();
    })
    .catch(err => {
      console.error(`[${new Date().toISOString()}] Unable to connect to the NFL database:`, err);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`[${new Date().toISOString()}] Retrying NFL connection (attempt ${retryCount}/${maxRetries})...`);
        setTimeout(testConnection, 5000);
      }
    });
};

testConnection();

console.log('NFL Database config:', pool.options.database);

module.exports = pool; 