const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config({ path: '.env.production' });

async function createAdminUser() {
  try {
    // Generate a hashed password
    const password = 'Admin123!'; // You can change this password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const query = `
      INSERT INTO users (email, password, first_name, last_name, username, profile_logo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, username
    `;
    
    const values = [
      'admin@bluefishsports.com',
      hashedPassword,
      'Admin',
      'User',
      'admin',
      'default-logo.png'
    ];

    const result = await pool.query(query, values);
    console.log('Admin user created successfully:', result.rows[0]);
    console.log('Password:', password); // Log the password so you can use it to login
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    pool.end();
  }
}

createAdminUser(); 