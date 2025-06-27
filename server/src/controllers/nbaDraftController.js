const pool = require('../config/NBADatabase');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const DraftSettings = require('../models/DraftSettings');

const nbaDraftController = {
  // Welcome message
  async getWelcomeMessage(req, res) {
    try {
      // Test which database you're connected to
      const result = await pool.query("SELECT current_database() as db");
      console.log("Connected to database:", result.rows[0].db);

      res.json({
        success: true,
        message: 'Welcome to the NBA Draft API'
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
          player,
          position,
          school,
          rank,
          class
        FROM nba_prospects 
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
        FROM nba_expert_picks ep
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
        'SELECT DISTINCT expert FROM nba_expert_picks ORDER BY expert'
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
      const userId = req.params.userId; // Get userId from params
      const { username } = req.query; // Get username from query
      let user_id = userId;

      // If username is provided, look up the user ID
      if (username) {
        const userResult = await pool.query(
          'SELECT id FROM nba_users WHERE username = $1',
          [username]
        );
        if (userResult.rows.length === 0) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        user_id = userResult.rows[0].id;
      }

      // If no userId (from params or username lookup), use the authenticated user
      if (!user_id) {
        user_id = req.user.id;
      }

      const result = await pool.query(`
        SELECT 
            nus.*,
            nu.username
        FROM nba_user_selections nus
        JOIN nba_users nu ON nus.user_id = nu.id
        WHERE nus.user_id = $1
        ORDER BY nus.pick ASC
      `, [user_id]);
      res.json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      console.error('Error in getUserSelections:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user selections'
      });
    }
  },

  async createUserSelection(req, res) {
    try {
      const { userId, pick, team, player, position, trade, confirmed, is_locked } = req.body;
      const result = await pool.query(`
        INSERT INTO nba_user_selections (user_id, pick, team, player, position, trade, confirmed, is_locked)
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
        UPDATE nba_user_selections
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
        UPDATE nba_user_selections
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
      const result = await pool.query('SELECT * FROM nba_teams ORDER BY original_pick_order');
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
        FROM nba_draft_picks dp
        LEFT JOIN nba_prospects p ON dp.player_id = p.id
        LEFT JOIN nba_teams t ON dp.team_id = t.id
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
      const { playerId, teamId, round, pickNumber } = req.body;
      const result = await pool.query(`
        UPDATE nba_draft_picks
        SET player_id = $1, team_id = $2, round = $3, pick_number = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `, [playerId, teamId, round, pickNumber, pickId]);
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

  // Debug operations
  async debugUserSelections(req, res) {
    try {
      const result = await pool.query(`
        SELECT us.*, u.username
        FROM nba_user_selections us
        JOIN nba_users u ON us.user_id = u.id
        ORDER BY us.user_id, us.pick
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

  // Actual results operations
  async getActualResults(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          ar.id,
          ar.pick,
          ar.team,
          ar.player,
          ar.position,
          ar.trade,
          ar.points_scored
        FROM nba_actual_results ar
        ORDER BY ar.pick
      `);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting actual results:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting actual results'
      });
    }
  },

  // Add function to update actual results from Excel
  async updateActualResults(req, res) {
    try {
      const { results } = req.body;
      
      // Clear existing results
      await pool.query('DELETE FROM nba_actual_results');
      
      // Insert new results
      for (const result of results) {
        await pool.query(
          `INSERT INTO nba_actual_results (pick, team, player, position, trade, points_scored)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            result.pick,
            result.team,
            result.player || null,
            result.position || null,
            result.trade || false,
            result.points_scored || 0
          ]
        );
      }
      
      res.json({
        success: true,
        message: 'Actual results updated successfully'
      });
    } catch (error) {
      console.error('Error updating actual results:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating actual results'
      });
    }
  },

  // Leaderboard operations
  async getLeaderboard(req, res) {
    try {
      const result = await pool.query(`
        WITH user_scores AS (
          SELECT 
            u.id,
            u.username,
            u.profile_logo as avatar_url,
            COUNT(CASE 
              WHEN ar.player IS NOT NULL 
              AND ar.player != 'TBD'
              AND TRIM(ar.player) != ''
              AND TRIM(us.team) = TRIM(ar.team)
              AND TRIM(us.player) = TRIM(ar.player)
              AND us.position = ar.position 
              AND us.trade = ar.trade 
              THEN 1 
            END) as correct_selections,
            SUM(
              CASE 
                WHEN ar.player IS NOT NULL 
                AND ar.player != 'TBD'
                AND TRIM(ar.player) != ''
                THEN
                  -- Team points (100 if team matches)
                  CASE WHEN TRIM(us.team) = TRIM(ar.team) THEN 100 ELSE 0 END +
                  
                  -- Player points (100 for matching pick with player, 100 for matching player with team)
                  CASE WHEN TRIM(us.player) = TRIM(ar.player) THEN 100 ELSE 0 END +
                  CASE WHEN EXISTS (
                    SELECT 1 
                    FROM nba_actual_results ar2 
                    WHERE ar2.player IS NOT NULL 
                    AND ar2.player != 'TBD'
                    AND TRIM(ar2.player) != ''
                    AND TRIM(ar2.team) = TRIM(us.team)
                    AND TRIM(ar2.player) = TRIM(us.player)
                  ) THEN 100 ELSE 0 END +
                  
                  -- Position points (50 for matching pick with position, 50 for matching position with team)
                  CASE WHEN us.position = ar.position THEN 50 ELSE 0 END +
                  CASE WHEN EXISTS (
                    SELECT 1 
                    FROM nba_actual_results ar2 
                    WHERE ar2.player IS NOT NULL 
                    AND ar2.player != 'TBD'
                    AND TRIM(ar2.player) != ''
                    AND TRIM(ar2.team) = TRIM(us.team)
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
                ELSE 0
              END
            ) as total_points
          FROM nba_users u
          LEFT JOIN nba_user_selections us ON u.id = us.user_id
          LEFT JOIN nba_actual_results ar ON us.pick = ar.pick
          GROUP BY u.id, u.username, u.profile_logo
        )
        SELECT 
          id,
          username,
          avatar_url,
          correct_selections,
          total_points,
          ROUND((total_points::numeric / (600 * 30)) * 100, 2) as percentage_score
        FROM user_scores
        ORDER BY total_points DESC, correct_selections DESC
      `);
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting leaderboard'
      });
    }
  },

  // Lock date operations
  async getLockDate(req, res) {
    try {
      const result = await pool.query('SELECT lock_date FROM nba_draft_settings WHERE id = 1');
      res.json({
        success: true,
        data: {
          lockDate: result.rows[0]?.lock_date || null
        }
      });
    } catch (error) {
      console.error('Error getting lock date:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting lock date'
      });
    }
  },

  async updateLockDate(req, res) {
    try {
      const { lockDate } = req.body;
      const result = await pool.query(`
        UPDATE nba_draft_settings
        SET lock_date = $1
        WHERE id = 1
        RETURNING lock_date
      `, [lockDate]);
      res.json({
        success: true,
        data: {
          lockDate: result.rows[0]?.lock_date
        }
      });
    } catch (error) {
      console.error('Error updating lock date:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating lock date'
      });
    }
  }
};

module.exports = nbaDraftController; 