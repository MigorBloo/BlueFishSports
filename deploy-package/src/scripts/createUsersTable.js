const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.development') });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000,
    query_timeout: 10000
});

async function createUsersTable() {
    try {
        // Create extension for UUID if it doesn't exist
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        `);
        console.log('UUID extension created or already exists');

        // Drop existing users table if it exists
        await pool.query(`
            DROP TABLE IF EXISTS users CASCADE;
        `);
        console.log('Existing users table dropped');

        // Create users table
        await pool.query(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                profile_logo TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Users table created successfully');

        console.log('All operations completed successfully');
    } catch (err) {
        console.error('Error creating users table:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

// Run the table creation
createUsersTable().catch(console.error); 