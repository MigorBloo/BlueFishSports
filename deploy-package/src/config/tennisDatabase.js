const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`)
});

// Debug logging
console.log('Tennis Database Configuration:');
console.log('Host:', process.env.TENNIS_DB_HOST);
console.log('Port:', process.env.TENNIS_DB_PORT);
console.log('Database:', process.env.TENNIS_DB_NAME);
console.log('Username:', process.env.TENNIS_DB_USER);
console.log('Password:', process.env.TENNIS_DB_PASSWORD ? '***' : 'not set');

if (!process.env.TENNIS_DB_PASSWORD) {
  console.error('TENNIS_DB_PASSWORD is not set in environment variables');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.TENNIS_DB_HOST || 'nfldraft-db.cj0amasyek81.eu-west-2.rds.amazonaws.com',
  port: process.env.TENNIS_DB_PORT || 5432,
  database: process.env.TENNIS_DB_NAME || 'tennis',
  user: process.env.TENNIS_DB_USER || 'postgres',
  password: process.env.TENNIS_DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for RDS SSL
  } : false,
  // Connection pool settings
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to be established
  maxUses: 7500, // Maximum number of times a connection can be used before being closed
});

// Log connection events with timestamps
pool.on('connect', () => {
  console.log(`[${new Date().toISOString()}] New tennis client connected to the database`);
});

pool.on('error', (err, client) => {
  console.error(`[${new Date().toISOString()}] Unexpected error on idle tennis client:`, err);
  // Attempt to reconnect
  setTimeout(() => {
    pool.connect()
      .then(client => {
        console.log(`[${new Date().toISOString()}] Successfully reconnected to the tennis database`);
        client.release();
      })
      .catch(err => console.error(`[${new Date().toISOString()}] Tennis reconnection failed:`, err));
  }, 5000);
});

// Test the connection with retry logic
const maxRetries = 3;
let retryCount = 0;

const testConnection = () => {
  pool.connect()
    .then(client => {
      console.log(`[${new Date().toISOString()}] Tennis database connection has been established successfully.`);
      client.release();
    })
    .catch(err => {
      console.error(`[${new Date().toISOString()}] Unable to connect to the tennis database:`, err);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`[${new Date().toISOString()}] Retrying tennis connection (attempt ${retryCount}/${maxRetries})...`);
        setTimeout(testConnection, 5000);
      }
    });
};

testConnection();

module.exports = pool; 