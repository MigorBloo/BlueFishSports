const pool = require('../config/database');

const dbService = {
  // Debug function to check current state
  async debugUserSelections(userId) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM user_selections WHERE user_id = $1 ORDER BY id DESC',
        [userId]
      );
      console.log('Current user selections:', rows);
      return rows;
    } catch (error) {
      console.error('Error debugging user selections:', error);
      throw error;
    }
  },

  // Prospects operations
  async getProspects() {
    try {
      const { rows } = await pool.query('SELECT * FROM prospects ORDER BY rank LIMIT 200');
      return rows;
    } catch (error) {
      console.error('Error getting prospects:', error);
      throw error;
    }
  },

  // Expert picks operations
  async getExpertPicks(expertName) {
    try {
      console.log(`Fetching expert picks for expert: ${expertName || 'all'}`);
      const query = expertName 
        ? `SELECT ep.*, t.name as team_name, p.name as player_name, p.position
           FROM expert_picks ep
           LEFT JOIN teams t ON ep.team_id = t.id
           LEFT JOIN prospects p ON ep.player_id = p.id
           WHERE ep.expert_name = $1
           ORDER BY ep.pick_number`
        : `SELECT ep.*, t.name as team_name, p.name as player_name, p.position
           FROM expert_picks ep
           LEFT JOIN teams t ON ep.team_id = t.id
           LEFT JOIN prospects p ON ep.player_id = p.id
           ORDER BY ep.pick_number`;
      const values = expertName ? [expertName] : [];
      
      const { rows } = await pool.query(query, values);
      console.log(`Found ${rows.length} expert picks`);
      return rows;
    } catch (error) {
      console.error('Error getting expert picks:', error);
      throw error;
    }
  },

  async getExpertNames() {
    try {
      const { rows } = await pool.query('SELECT DISTINCT expert_name FROM expert_picks');
      return rows.map(row => row.expert_name);
    } catch (error) {
      console.error('Error getting expert names:', error);
      throw error;
    }
  },

  // User selections operations
  async getUserSelections(userId) {
    try {
      // First get all teams
      const { rows: teams } = await pool.query('SELECT * FROM teams');
      
      // Get existing selections
      const { rows: existingSelections } = await pool.query(
        'SELECT * FROM user_selections WHERE user_id = $1',
        [userId]
      );
      
      // Create a map of existing selections by pick number
      const selectionsMap = new Map(
        existingSelections.map(s => [s.pick_number, s])
      );
      
      // Create selections for all teams, using existing data where available
      const allSelections = teams.map(team => {
        const existingSelection = selectionsMap.get(team.original_pick_order);
        if (existingSelection) {
          return existingSelection;
        }
        
        // Create a new selection if none exists
        return {
          id: 0,
          user_id: userId,
          pick_number: team.original_pick_order,
          team_id: team.id,
          player_id: 0,
          team_name: team.name,
          player_name: '',
          position: '',
          trade: null,
          confirmed: false
        };
      });
      
      return allSelections;
    } catch (error) {
      console.error('Error getting user selections:', error);
      throw error;
    }
  },

  async updateUserSelection(id, updateData) {
    try {
      const { rows: [updatedSelection] } = await pool.query(
        `UPDATE user_selections 
         SET ${Object.keys(updateData).map((key, i) => `${key} = $${i + 2}`).join(', ')}
         WHERE id = $1
         RETURNING *`,
        [id, ...Object.values(updateData)]
      );
      return updatedSelection;
    } catch (error) {
      console.error('Error updating user selection:', error);
      throw error;
    }
  },

  async confirmUserSelection(id, userId) {
    try {
      // First get the existing selection
      const { rows: [existingSelection] } = await pool.query(
        'SELECT * FROM user_selections WHERE id = $1',
        [id]
      );

      if (!existingSelection) {
        throw new Error('Selection not found');
      }

      // Create a new selection with confirmed=true
      const { rows: [newSelection] } = await pool.query(
        `INSERT INTO user_selections 
         (user_id, pick_id, prospect_id, team_id, confirmed) 
         VALUES ($1, $2, $3, $4, true) 
         RETURNING *`,
        [
          userId,
          existingSelection.pick_id,
          existingSelection.prospect_id,
          existingSelection.team_id
        ]
      );

      // Delete the old selection
      await pool.query(
        'DELETE FROM user_selections WHERE id = $1',
        [id]
      );

      return newSelection;
    } catch (error) {
      console.error('Error confirming user selection:', error);
      throw error;
    }
  },

  async createUserSelection(data) {
    try {
      const { rows: [newSelection] } = await pool.query(
        `INSERT INTO user_selections 
         (user_id, pick_id, prospect_id, team_id, confirmed) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [
          data.user_id,
          data.pick_id,
          data.prospect_id,
          data.team_id,
          data.confirmed || false
        ]
      );
      return newSelection;
    } catch (error) {
      console.error('Error creating user selection:', error);
      throw error;
    }
  },

  // Teams operations
  async getTeams() {
    try {
      const { rows } = await pool.query('SELECT * FROM teams');
      return rows;
    } catch (error) {
      console.error('Error getting teams:', error);
      throw error;
    }
  }
};

const createUser = async (userData) => {
  const { email, password, firstName, lastName, username, verificationToken } = userData;
  const query = `
    INSERT INTO users (email, password, first_name, last_name, username, verification_token, is_verified)
    VALUES ($1, $2, $3, $4, $5, $6, false)
    RETURNING id, email, first_name, last_name, username, is_verified
  `;
  const values = [email, password, firstName, lastName, username, verificationToken];
  
  try {
    const result = await pool.query(query, values);
    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      username: result.rows[0].username,
      isVerified: result.rows[0].is_verified
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password, first_name, last_name, username, is_verified
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
      isVerified: result.rows[0].is_verified
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

const verifyUserEmail = async (token) => {
  const query = `
    UPDATE users
    SET is_verified = true, verification_token = NULL
    WHERE verification_token = $1 AND is_verified = false
    RETURNING id, email, first_name, last_name, username, is_verified
  `;
  
  try {
    const result = await pool.query(query, [token]);
    if (result.rows.length === 0) return null;
    
    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      username: result.rows[0].username,
      isVerified: result.rows[0].is_verified
    };
  } catch (error) {
    console.error('Error verifying user email:', error);
    throw error;
  }
};

const updateVerificationToken = async (userId, token) => {
  const query = `
    UPDATE users
    SET verification_token = $1
    WHERE id = $2
    RETURNING id, email
  `;
  
  try {
    const result = await pool.query(query, [token, userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating verification token:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  verifyUserEmail,
  updateVerificationToken,
  ...dbService
}; 