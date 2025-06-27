const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env.production' });

const config = {
    host: process.env.NBA_DB_HOST,
    port: process.env.NBA_DB_PORT,
    user: process.env.NBA_DB_USER,
    password: process.env.NBA_DB_PASSWORD,
    database: process.env.NBA_DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
};

async function addEmailVerificationColumns() {
    let connection;
    
    try {
        console.log('Connecting to NBA database...');
        console.log('Host:', config.host);
        console.log('Database:', config.database);
        console.log('User:', config.user);
        
        connection = await mysql.createConnection(config);
        
        // Add columns to nba_users table
        console.log('Adding email verification columns to nba_users...');
        await connection.execute(`
            ALTER TABLE nba_users 
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL
        `);
        
        // Add columns to nfl_users table
        console.log('Adding email verification columns to nfl_users...');
        await connection.execute(`
            ALTER TABLE nfl_users 
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL
        `);
        
        // Add columns to tennis_users table
        console.log('Adding email verification columns to tennis_users...');
        await connection.execute(`
            ALTER TABLE tennis_users 
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL
        `);
        
        console.log('✅ Email verification columns added successfully to all user tables!');
        
        // Verify the columns were added
        console.log('\nVerifying columns were added...');
        
        const [nbaColumns] = await connection.execute('DESCRIBE nba_users');
        const [nflColumns] = await connection.execute('DESCRIBE nfl_users');
        const [tennisColumns] = await connection.execute('DESCRIBE tennis_users');
        
        console.log('\nNBA Users table columns:');
        nbaColumns.forEach(col => {
            if (col.Field.includes('email_verified') || col.Field.includes('verification') || col.Field.includes('reset')) {
                console.log(`  - ${col.Field}: ${col.Type}`);
            }
        });
        
        console.log('\nNFL Users table columns:');
        nflColumns.forEach(col => {
            if (col.Field.includes('email_verified') || col.Field.includes('verification') || col.Field.includes('reset')) {
                console.log(`  - ${col.Field}: ${col.Type}`);
            }
        });
        
        console.log('\nTennis Users table columns:');
        tennisColumns.forEach(col => {
            if (col.Field.includes('email_verified') || col.Field.includes('verification') || col.Field.includes('reset')) {
                console.log(`  - ${col.Field}: ${col.Type}`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error adding email verification columns:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the migration
addEmailVerificationColumns()
    .then(() => {
        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration failed:', error.message);
        process.exit(1);
    });
