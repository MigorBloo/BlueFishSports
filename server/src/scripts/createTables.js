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

async function createTables() {
    try {
        // Drop existing tables
        await pool.query(`
            DROP TABLE IF EXISTS expert_picks CASCADE;
            DROP TABLE IF EXISTS prospects CASCADE;
            DROP TABLE IF EXISTS teams CASCADE;
        `);
        console.log('Existing tables dropped');

        // Create prospects table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS prospects (
                id SERIAL PRIMARY KEY,
                player VARCHAR(255) UNIQUE NOT NULL,
                position VARCHAR(50) NOT NULL,
                position_rank INTEGER,
                school VARCHAR(255) NOT NULL,
                class VARCHAR(50),
                rank INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Prospects table created or already exists');

        // Create teams table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS teams (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                original_pick_order INTEGER NOT NULL,
                logo_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Teams table created or already exists');

        // Create expert_picks table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS expert_picks (
                id SERIAL PRIMARY KEY,
                expert VARCHAR(255) NOT NULL,
                pick INTEGER NOT NULL,
                logo_urls TEXT,
                team VARCHAR(255) NOT NULL,
                player VARCHAR(255) NOT NULL,
                position VARCHAR(50) NOT NULL,
                trade BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(expert, pick)
            );
        `);
        console.log('Expert picks table created or already exists');

        console.log('All tables created successfully');
    } catch (err) {
        console.error('Error creating tables:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

// Run the table creation
createTables().catch(console.error); 