const { Pool } = require('pg');
const pool = require('../config/database');

const User = {
  async create(userData) {
    const { email, password, firstName, lastName, username, profileLogo } = userData;
    const query = `
      INSERT INTO users (email, password, first_name, last_name, username, profile_logo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, username, profile_logo
    `;
    const values = [email, password, firstName, lastName, username, profileLogo];
    
    try {
      const result = await pool.query(query, values);
      return {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        username: result.rows[0].username,
        profileLogo: result.rows[0].profile_logo
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async findByEmail(email) {
    const query = `
      SELECT id, email, password, first_name, last_name, username, profile_logo
      FROM users
      WHERE email = $1
    `;
    
    try {
      const result = await pool.query(query, [email]);
      if (result.rows.length === 0) return null;
      
      return {
        id: result.rows[0].id,
        email: result.rows[0].email,
        password: result.rows[0].password,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        username: result.rows[0].username,
        profileLogo: result.rows[0].profile_logo
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  async findById(id) {
    const query = `
      SELECT id, email, first_name, last_name, username, profile_logo
      FROM users
      WHERE id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      
      return {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        username: result.rows[0].username,
        profileLogo: result.rows[0].profile_logo
      };
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  },

  async updateProfile(id, updates) {
    const { firstName, lastName, username, profileLogo } = updates;
    const query = `
      UPDATE users
      SET first_name = $1, last_name = $2, username = $3, profile_logo = $4
      WHERE id = $5
      RETURNING id, email, first_name, last_name, username, profile_logo
    `;
    const values = [firstName, lastName, username, profileLogo, id];
    
    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) return null;
      
      return {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        username: result.rows[0].username,
        profileLogo: result.rows[0].profile_logo
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};

module.exports = User; 