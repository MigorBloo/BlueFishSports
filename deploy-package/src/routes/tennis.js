const express = require('express');
const router = express.Router();
const pool = require('../config/tennisDatabase');
const mainPool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Save user selections
router.post('/selections', verifyToken, async (req, res) => {
  console.log('Received selection request:', req.body);
  const { user_id, tournament, gold_selection, silver_selection, bronze_selection } = req.body;

  try {
    // First check if tournament is locked
    console.log('Checking if tournament is locked:', tournament);
    const lockCheck = await pool.query(
      'SELECT is_locked FROM public.user_selections WHERE tournament = $1 LIMIT 1',
      [tournament]
    );

    if (lockCheck.rows.length > 0 && lockCheck.rows[0].is_locked) {
      console.log('Tournament is locked:', tournament);
      return res.status(400).json({ error: 'Tournament is locked' });
    }

    // Insert or update selection
    console.log('Attempting to save selections:', {
      user_id,
      tournament,
      gold_selection,
      silver_selection,
      bronze_selection
    });

    const result = await pool.query(
      `INSERT INTO public.user_selections 
       (user_id, tournament, gold_selection, silver_selection, bronze_selection)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, tournament) 
       DO UPDATE SET 
         gold_selection = $3,
         silver_selection = $4,
         bronze_selection = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [user_id, tournament, gold_selection, silver_selection, bronze_selection]
    );

    console.log('Selection saved successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving selections:', error);
    res.status(500).json({ error: 'Failed to save selections' });
  }
});

// Get user selections
router.get('/selections/:user_id', verifyToken, async (req, res) => {
  const { user_id } = req.params;
  console.log('Fetching selections for user:', user_id);

  try {
    const result = await pool.query(
      'SELECT * FROM public.user_selections WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    console.log('Found selections:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching selections:', error);
    res.status(500).json({ error: 'Failed to fetch selections' });
  }
});

// Lock tournament
router.post('/tournaments/:tournament/lock', verifyToken, async (req, res) => {
  const { tournament } = req.params;
  console.log('Attempting to lock tournament:', tournament);

  try {
    const result = await pool.query(
      'UPDATE public.user_selections SET is_locked = TRUE WHERE tournament = $1 RETURNING *',
      [tournament]
    );
    console.log('Tournament locked:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error locking tournament:', error);
    res.status(500).json({ error: 'Failed to lock tournament' });
  }
});

// Get tournament results

router.get('/results/summary/:user_id', verifyToken, async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(
          CASE 
            WHEN LOWER(TRIM(us.gold_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END
        ), 0) AS total_gold_points,
        COALESCE(SUM(
          CASE 
            WHEN LOWER(TRIM(us.silver_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END
        ), 0) AS total_silver_points,
        COALESCE(SUM(
          CASE 
            WHEN LOWER(TRIM(us.bronze_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END
        ), 0) AS total_bronze_points,
        COALESCE(SUM(
          CASE 
            WHEN LOWER(TRIM(us.gold_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END +
          CASE 
            WHEN LOWER(TRIM(us.silver_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END +
          CASE 
            WHEN LOWER(TRIM(us.bronze_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END
        ), 0) AS total_points
      FROM user_selections us
      JOIN weekly_results wr ON us.tournament = wr.tournament
      WHERE us.user_id = $1
    `, [user_id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching results summary:', error);
    res.status(500).json({ error: 'Failed to fetch results summary' });
  }
});

router.get('/results/:user_id', verifyToken, async (req, res) => {
  const { user_id } = req.params;
  console.log('Fetching tournament results for user:', user_id);
  try {
    // Only check for user_selections and weekly_results tables
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_selections'
      ) as selections_exist,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'weekly_results'
      ) as weekly_results_exist
    `);
    
    console.log('Table check result:', tableCheck.rows[0]);
    
    if (!tableCheck.rows[0].selections_exist || !tableCheck.rows[0].weekly_results_exist) {
      console.error('Required tables do not exist');
      return res.status(500).json({ error: 'Database tables not found' });
    }

    console.log('Executing query with user_id:', user_id);
    const result = await pool.query(
      `SELECT
        us.tournament,
        us.gold_selection,
        wr_gold.result AS gold_result,
        wr_gold.points AS gold_points,
        us.silver_selection,
        wr_silver.result AS silver_result,
        wr_silver.points AS silver_points,
        us.bronze_selection,
        wr_bronze.result AS bronze_result,
        wr_bronze.points AS bronze_points,
        COALESCE(wr_gold.points, 0) + COALESCE(wr_silver.points, 0) + COALESCE(wr_bronze.points, 0) AS total_points
      FROM public.user_selections us
      LEFT JOIN public.weekly_results wr_gold ON wr_gold.tournament = us.tournament AND LOWER(TRIM(wr_gold.player)) = LOWER(TRIM(us.gold_selection))
      LEFT JOIN public.weekly_results wr_silver ON wr_silver.tournament = us.tournament AND LOWER(TRIM(wr_silver.player)) = LOWER(TRIM(us.silver_selection))
      LEFT JOIN public.weekly_results wr_bronze ON wr_bronze.tournament = us.tournament AND LOWER(TRIM(wr_bronze.player)) = LOWER(TRIM(us.bronze_selection))
      WHERE us.user_id = $1
      ORDER BY us.tournament DESC`,
      [user_id]
    );
    console.log('Query executed successfully. Number of rows:', result.rows.length);
    console.log('First row sample:', result.rows[0]);
    res.json(result.rows);
  } catch (error) {
    console.error('Detailed error in /results/:user_id:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Get leaderboard data
router.get('/leaderboard', verifyToken, async (req, res) => {
  console.log('Leaderboard endpoint called');
  try {
    // First check if tables exist
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'leaderboard'
      ) as leaderboard_exist
    `);
    
    console.log('Table check result:', tableCheck.rows[0]);
    
    if (!tableCheck.rows[0].leaderboard_exist) {
      console.error('Leaderboard table does not exist');
      return res.status(500).json({ error: 'Leaderboard table not found' });
    }

    // Get leaderboard data
    console.log('Fetching leaderboard data...');
    const result = await pool.query(`
      SELECT 
        user_id,
        rank,
        username,
        total_points,
        points_behind_leader,
        movement_points,
        movement_rank,
        previous_rank
      FROM leaderboard
      ORDER BY rank ASC
    `);

    console.log('Leaderboard query result:', {
      rowCount: result.rows.length,
      firstRow: result.rows[0]
    });

    // If leaderboard is empty, get all users with zero points
    if (result.rows.length === 0) {
      console.log('Leaderboard is empty, fetching all users with zero points');
      const usersResult = await mainPool.query(`
        SELECT 
          id as user_id,
          username,
          0 as total_points,
          0 as points_behind_leader,
          0 as movement_points,
          0 as movement_rank,
          0 as previous_rank
        FROM users
        ORDER BY username ASC
      `);
      
      // Add rank numbers
      const usersWithRank = usersResult.rows.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      
      console.log('Users with zero points:', usersWithRank.length);
      return res.json(usersWithRank);
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Detailed error in leaderboard endpoint:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard data',
      details: error.message
    });
  }
});

// Get user results by username
router.get('/user-results/:username', verifyToken, async (req, res) => {
  const { username } = req.params;
  console.log('Fetching results for username:', username);

  try {
    // First get the user_id from the leaderboard table
    const userResult = await pool.query(
      'SELECT user_id FROM leaderboard WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].user_id;
    console.log('Found user_id:', userId);

    // Get the results using the same query as /results/:user_id
    const result = await pool.query(
      `SELECT
        us.tournament,
        us.gold_selection,
        wr_gold.result AS gold_result,
        wr_gold.points AS gold_points,
        us.silver_selection,
        wr_silver.result AS silver_result,
        wr_silver.points AS silver_points,
        us.bronze_selection,
        wr_bronze.result AS bronze_result,
        wr_bronze.points AS bronze_points,
        COALESCE(wr_gold.points, 0) + COALESCE(wr_silver.points, 0) + COALESCE(wr_bronze.points, 0) AS total_points
      FROM public.user_selections us
      LEFT JOIN public.weekly_results wr_gold ON wr_gold.tournament = us.tournament AND LOWER(TRIM(wr_gold.player)) = LOWER(TRIM(us.gold_selection))
      LEFT JOIN public.weekly_results wr_silver ON wr_silver.tournament = us.tournament AND LOWER(TRIM(wr_silver.player)) = LOWER(TRIM(us.silver_selection))
      LEFT JOIN public.weekly_results wr_bronze ON wr_bronze.tournament = us.tournament AND LOWER(TRIM(wr_bronze.player)) = LOWER(TRIM(us.bronze_selection))
      WHERE us.user_id = $1
      ORDER BY us.tournament DESC`,
      [userId]
    );

    // Get the summary using the same query as /results/summary/:user_id
    const summaryResult = await pool.query(`
      SELECT
        COALESCE(SUM(
          CASE 
            WHEN LOWER(TRIM(us.gold_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END
        ), 0) AS gold_points,
        COALESCE(SUM(
          CASE 
            WHEN LOWER(TRIM(us.silver_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END
        ), 0) AS silver_points,
        COALESCE(SUM(
          CASE 
            WHEN LOWER(TRIM(us.bronze_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END
        ), 0) AS bronze_points,
        COALESCE(SUM(
          CASE 
            WHEN LOWER(TRIM(us.gold_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END +
          CASE 
            WHEN LOWER(TRIM(us.silver_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END +
          CASE 
            WHEN LOWER(TRIM(us.bronze_selection)) = LOWER(TRIM(wr.player)) 
            THEN wr.points 
            ELSE 0 
          END
        ), 0) AS total_points
      FROM user_selections us
      JOIN weekly_results wr ON us.tournament = wr.tournament
      WHERE us.user_id = $1
    `, [userId]);

    console.log('Summary result:', summaryResult.rows[0]);

    // Combine the results and summary into a single response
    res.json({
      results: result.rows,
      summary: summaryResult.rows[0]
    });

  } catch (error) {
    console.error('Detailed error in user-results endpoint:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Failed to fetch user results',
      details: error.message
    });
  }
});

module.exports = router;