const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/NBADatabase');

const userService = {
  // Create a new user
  async createUser(userData) {
    console.log('Creating user with data:', { 
      ...userData, 
      password: '***' // Don't log the actual password
    });
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = uuidv4();
    const now = new Date();

    try {
      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert the new user (now includes residence)
        const result = await client.query(
          `INSERT INTO nba_users (
            id, email, password, first_name, last_name, username, 
            profile_logo, created_at, updated_at, residence
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id, email, first_name, last_name, username, profile_logo, residence`,
          [
            userId,
            userData.email,
            hashedPassword,
            userData.firstName,
            userData.lastName,
            userData.username,
            userData.profileLogo || '',
            now,
            now,
            userData.residence || null
          ]
        );

        await client.query('COMMIT');

        return {
          id: result.rows[0].id,
          email: result.rows[0].email,
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name,
          username: result.rows[0].username,
          profileLogo: result.rows[0].profile_logo,
          residence: result.rows[0].residence
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database error:', error);
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    const query = `
      SELECT id, email, password, first_name, last_name, username, profile_logo, residence
      FROM nba_users
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
        profileLogo: result.rows[0].profile_logo,
        residence: result.rows[0].residence
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id) {
    const query = `
      SELECT id, email, first_name, last_name, username, profile_logo, residence
      FROM nba_users
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
        profileLogo: result.rows[0].profile_logo,
        residence: result.rows[0].residence
      };
    } catch (error) {
      console.error('Error getting user by id:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id, updates) {
    console.log('Updating user in database:', {
      id,
      updates: {
        ...updates,
        profileLogo: updates.profileLogo ? 'present' : 'null'
      }
    });

    const { firstName, lastName, username, profileLogo, residence } = updates;
    const query = `
      UPDATE nba_users
      SET first_name = $1, last_name = $2, username = $3, profile_logo = $4, residence = $5
      WHERE id = $6
      RETURNING id, email, first_name, last_name, username, profile_logo, residence
    `;
    const values = [firstName, lastName, username, profileLogo, residence, id];
    
    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        console.error('No user found with id:', id);
        return null;
      }
      
      const updatedUser = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        username: result.rows[0].username,
        profileLogo: result.rows[0].profile_logo,
        residence: result.rows[0].residence
      };

      console.log('User updated in database:', {
        id: updatedUser.id,
        username: updatedUser.username,
        hasProfileLogo: !!updatedUser.profileLogo,
        profileLogo: updatedUser.profileLogo,
        residence: updatedUser.residence
      });

      return updatedUser;
    } catch (error) {
      console.error('Database error updating user:', {
        error: error.message,
        code: error.code,
        detail: error.detail
      });
      throw error;
    }
  },

  // Validate password
  async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
};

module.exports = userService; 