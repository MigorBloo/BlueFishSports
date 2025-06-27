const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`)
});

// Create connection pools for both databases
const nfldraftPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const nbadraftPool = new Pool({
  host: process.env.NBA_DB_HOST,
  port: process.env.NBA_DB_PORT,
  database: process.env.NBA_DB_NAME,
  user: process.env.NBA_DB_USER,
  password: process.env.NBA_DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function copyUsers() {
  try {
    // Get users from nfldraft database
    const nfldraftClient = await nfldraftPool.connect();
    const usersResult = await nfldraftClient.query('SELECT * FROM users');
    const users = usersResult.rows;
    nfldraftClient.release();

    // Insert users into nbadraft database
    const nbadraftClient = await nbadraftPool.connect();
    for (const user of users) {
      await nbadraftClient.query(
        `INSERT INTO nba_users (id, email, password, first_name, last_name, username, profile_logo, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.email,
          user.password,
          user.first_name,
          user.last_name,
          user.username,
          user.profile_logo,
          user.created_at,
          user.updated_at
        ]
      );
    }
    nbadraftClient.release();

    console.log('Successfully copied users from nfldraft to nbadraft database');
  } catch (error) {
    console.error('Error copying users:', error);
  } finally {
    await nfldraftPool.end();
    await nbadraftPool.end();
  }
}

copyUsers(); 