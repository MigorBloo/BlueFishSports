const pool = require('../config/database');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const DraftSettings = require('../models/DraftSettings');

const nflDraftController = {
  // Welcome message
  async getWelcomeMessage(req, res) {
    try {
      res.json({
        success: true,
        message: 'Welcome to the NFL Draft API'
      });
    } catch (error) {
      console.error('Error getting welcome message:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting welcome message'
      });
    }
  },

  // Prospects operations
  async getTop200Prospects(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          id,
          name as player,
          position,
          school,
          rank,
          class
        FROM prospects 
        ORDER BY rank 
        LIMIT 200
      `);
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting prospects:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting prospects'
      });
    }
  },

  // Expert picks operations
  async getExpertPicks(req, res) {
    try {
      const { expert } = req.query;
      let query = `
        SELECT 
          ep.id, 
          ep.expert, 
          ep.pick, 
          ep.logo_urls, 
          ep.team,
          ep.player,
          ep.position,
          ep.trade, 
          ep.created_at, 
          ep.updated_at
        FROM expert_picks ep
      `;
      
      const params = [];
      if (expert) {
        query += ' WHERE ep.expert = $1';
        params.push(expert);
      }
      
      query += ' ORDER BY ep.pick';
      
      const result = await pool.query(query, params);
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting expert picks:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting expert picks'
      });
    }
  },

  async getExpertNames(req, res) {
    try {
      const result = await pool.query(
        'SELECT DISTINCT expert FROM expert_picks ORDER BY expert'
      );
      res.json({
        success: true,
        data: result.rows.map(row => row.expert)
      });
    } catch (error) {
      console.error('Error getting expert names:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting expert names'
      });
    }
  },

  // User selections operations
  async getUserSelections(req, res) {
    try {
      const { username, userId } = req.query;
      let user_id = userId;

      // If username is provided, look up the user ID
      if (username) {
        const userResult = await pool.query(
          'SELECT id FROM users WHERE username = $1',
          [username]
        );
        if (userResult.rows.length === 0) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        user_id = userResult.rows[0].id;
      }

      // If no userId (from query or username lookup), use the authenticated user
      if (!user_id) {
        user_id = req.user.id;
      }

      const result = await pool.query(`
        SELECT id, user_id as "userId", pick, team, player, position, trade, confirmed, is_locked,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM user_selections
        WHERE user_id = $1
        ORDER BY pick
      `, [user_id]);
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting user selections:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting user selections'
      });
    }
  },

  async createUserSelection(req, res) {
    try {
      const { userId, pick, team, player, position, trade, confirmed, is_locked } = req.body;
      const result = await pool.query(`
        INSERT INTO user_selections (user_id, pick, team, player, position, trade, confirmed, is_locked)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id as "userId", pick, team, player, position, trade, confirmed, is_locked,
                  created_at as "createdAt", updated_at as "updatedAt"
      `, [userId, pick, team, player, position, trade, confirmed || false, is_locked || false]);
      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating user selection:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating user selection'
      });
    }
  },

  async updateUserSelection(req, res) {
    try {
      const { id } = req.params;
      const { pick, team, player, position, trade, confirmed } = req.body;
      const result = await pool.query(`
        UPDATE user_selections
        SET pick = $1, team = $2, player = $3, position = $4, trade = $5, confirmed = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING id, user_id as "userId", pick, team, player, position, trade, confirmed,
                  created_at as "createdAt", updated_at as "updatedAt"
      `, [pick, team, player, position, trade, confirmed, id]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User selection not found'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating user selection:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user selection'
      });
    }
  },

  async confirmUserSelection(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        UPDATE user_selections
        SET confirmed = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, user_id as "userId", pick, team, player, position, trade, confirmed,
                  created_at as "createdAt", updated_at as "updatedAt"
      `, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User selection not found'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error confirming user selection:', error);
      res.status(500).json({
        success: false,
        message: 'Error confirming user selection'
      });
    }
  },

  // Teams operations
  async getTeams(req, res) {
    try {
      const result = await pool.query('SELECT * FROM teams ORDER BY original_pick_order');
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting teams:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting teams'
      });
    }
  },

  // Draft picks operations
  async getDraftPicks(req, res) {
    try {
      const result = await pool.query(`
        SELECT dp.*, p.name as player_name, t.name as team_name
        FROM draft_picks dp
        LEFT JOIN prospects p ON dp.player_id = p.id
        LEFT JOIN teams t ON dp.team_id = t.id
        ORDER BY dp.round, dp.pick_number
      `);
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting draft picks:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting draft picks'
      });
    }
  },

  async updateDraftPick(req, res) {
    try {
      const { pickId } = req.params;
      const { player_id, team_id } = req.body;
      const result = await pool.query(`
        UPDATE draft_picks
        SET player_id = $1, team_id = $2
        WHERE id = $3
        RETURNING *
      `, [player_id, team_id, pickId]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Draft pick not found'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating draft pick:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating draft pick'
      });
    }
  },

  // Debug route
  async debugUserSelections(req, res) {
    try {
      const result = await pool.query(`
        SELECT us.*, u.username, p.name as player_name, t.name as team_name
        FROM user_selections us
        JOIN users u ON us.user_id = u.id
        JOIN prospects p ON us.player_id = p.id
        LEFT JOIN teams t ON us.team_id = t.id
        ORDER BY us.user_id, us.round, us.pick_number
      `);
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting debug selections:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting debug selections'
      });
    }
  },

  getLockDate: async (req, res) => {
    try {
      const lockDate = await DraftSettings.getLockDate();
      
      if (!lockDate) {
        return res.status(404).json({
          success: false,
          error: 'Lock date not found'
        });
      }

      res.json({
        success: true,
        data: {
          lockDate: lockDate
        }
      });
    } catch (error) {
      console.error('Error getting lock date:', error);
      res.status(500).json({
        success: false,
        error: 'Error getting lock date'
      });
    }
  },

  updateLockDate: async (req, res) => {
    try {
      const { lockDate } = req.body;
      if (!lockDate) {
        return res.status(400).json({
          success: false,
          error: 'Lock date is required'
        });
      }

      const result = await DraftSettings.setLockDate(lockDate);
      
      res.json({
        success: true,
        data: {
          lockDate: result.lock_date
        }
      });
    } catch (error) {
      console.error('Error updating lock date:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating lock date'
      });
    }
  },

  async getActualResults(req, res) {
    try {
      // First, get existing results from the database
      const existingResults = await pool.query('SELECT * FROM actual_results ORDER BY pick');
      console.log('Existing results count:', existingResults.rows.length);
      
      // If we have existing results, return them immediately
      if (existingResults.rows.length > 0) {
        return res.json({
          success: true,
          data: existingResults.rows
        });
      }

      // Only read Excel file if we have no existing results
      const filePath = path.join(__dirname, '../../../client/src/apps/nfl-draft/Data/ActualResult.xlsx');
      console.log('Attempting to read Excel file from:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.log('Excel file not found at:', filePath);
        return res.json({
          success: true,
          data: []
        });
      }

      console.log('Excel file exists, reading...');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      const worksheet = workbook.worksheets[0];
      const data = [];
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const tradeValue = row.getCell(5).value;
          const rowData = {
            pick: rowNumber - 1,
            team: row.getCell(2).value,
            player: row.getCell(3).value,
            position: row.getCell(4).value,
            trade: tradeValue?.toString().toLowerCase() === 'yes',
            points_scored: 600 // Set points_scored to 600 for each pick
          };
          data.push(rowData);
        }
      });

      // Insert new data
      for (const row of data) {
        await pool.query(
          `INSERT INTO actual_results (pick, team, player, position, trade, points_scored)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            row.pick,
            row.team,
            row.player,
            row.position,
            row.trade,
            row.points_scored
          ]
        );
      }

      // Fetch and return all results
      const result = await pool.query('SELECT * FROM actual_results ORDER BY pick');
      return res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error in getActualResults:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error getting actual results'
      });
    }
  },

  getLeaderboard: async (req, res) => {
    try {
      console.log('Fetching leaderboard data...');
      
      // First, let's log the actual results to verify our base data
      const actualResults = await pool.query('SELECT * FROM actual_results ORDER BY pick');
      console.log('Actual Results:', actualResults.rows);
      
      // Now let's log user selections to see what we're comparing against
      const userSelections = await pool.query('SELECT * FROM user_selections ORDER BY user_id, pick');
      console.log('User Selections:', userSelections.rows);
      
      // Calculate final scores
      const result = await pool.query(`
        WITH user_scores AS (
          SELECT 
            u.id,
            u.username,
            u.profile_logo as avatar_url,
            COUNT(CASE 
              WHEN TRIM(us.team) = TRIM(ar.team)
              AND TRIM(us.player) = TRIM(ar.player)
              AND us.position = ar.position 
              AND us.trade = ar.trade 
              THEN 1 
            END) as correct_selections,
            SUM(
              -- Team points (100 if team matches)
              CASE WHEN TRIM(us.team) = TRIM(ar.team) THEN 100 ELSE 0 END +
              
              -- Player points (100 for matching pick with player, 100 for matching player with team)
              CASE WHEN TRIM(us.player) = TRIM(ar.player) THEN 100 ELSE 0 END +
              CASE WHEN EXISTS (
                SELECT 1 
                FROM actual_results ar2 
                WHERE TRIM(ar2.team) = TRIM(us.team)
                AND TRIM(ar2.player) = TRIM(us.player)
              ) THEN 100 ELSE 0 END +
              
              -- Position points (50 for matching pick with position, 50 for matching position with team)
              CASE WHEN us.position = ar.position THEN 50 ELSE 0 END +
              CASE WHEN EXISTS (
                SELECT 1 
                FROM actual_results ar2 
                WHERE TRIM(ar2.team) = TRIM(us.team)
                AND ar2.position = us.position
              ) THEN 50 ELSE 0 END +
              
              -- Trade points (100 if trade matches)
              CASE WHEN us.trade = ar.trade THEN 100 ELSE 0 END +
              
              -- Perfect match bonus (100 if all fields match)
              CASE 
                WHEN TRIM(us.team) = TRIM(ar.team)
                AND TRIM(us.player) = TRIM(ar.player)
                AND us.position = ar.position 
                AND us.trade = ar.trade 
                THEN 100 
                ELSE 0 
              END
            ) as total_points
          FROM users u
          LEFT JOIN user_selections us ON u.id = us.user_id
          LEFT JOIN actual_results ar ON us.pick = ar.pick
          GROUP BY u.id, u.username, u.profile_logo
        )
        SELECT 
          id,
          username,
          avatar_url,
          correct_selections,
          total_points,
          ROUND((total_points::numeric / (600 * 32)) * 100, 2) as percentage_score
        FROM user_scores
        ORDER BY total_points DESC
      `);
      
      console.log('Final leaderboard results:', result.rows);
      
      // Log detailed calculation for each user
      for (const row of result.rows) {
        console.log(`\nUser: ${row.username} (ID: ${row.id})`);
        console.log(`Correct Selections: ${row.correct_selections}`);
        console.log(`Total Points: ${row.total_points}`);
        console.log(`Percentage Score: ${row.percentage_score}%`);
        console.log(`Calculation: (${row.total_points} / (600 * 32)) * 100 = ${row.percentage_score}%`);
      }
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch leaderboard' 
      });
    }
  }
};

module.exports = nflDraftController; 