const { Pool } = require('pg');
const logger = require('../config/logger');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateLeaderboard() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Calculate final scores
    const updateScoresQuery = `
      UPDATE user_selections us
      SET final_score = (
        SELECT COUNT(*) 
        FROM actual_results ar 
        WHERE ar.pick_number = us.pick_number 
        AND ar.prospect_id = us.prospect_id
      )
      WHERE us.draft_id = (SELECT id FROM draft_settings WHERE is_active = true);
    `;
    await client.query(updateScoresQuery);

    // 2. Update leaderboard
    const updateLeaderboardQuery = `
      INSERT INTO leaderboard (user_id, username, score, draft_id)
      SELECT 
        u.id,
        u.username,
        SUM(us.final_score) as total_score,
        us.draft_id
      FROM users u
      JOIN user_selections us ON u.id = us.user_id
      WHERE us.draft_id = (SELECT id FROM draft_settings WHERE is_active = true)
      GROUP BY u.id, u.username, us.draft_id
      ON CONFLICT (user_id, draft_id) 
      DO UPDATE SET score = EXCLUDED.score;
    `;
    await client.query(updateLeaderboardQuery);

    await client.query('COMMIT');
    logger.info('Leaderboard updated successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error updating leaderboard:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function releaseResults() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Mark draft as completed
    const completeDraftQuery = `
      UPDATE draft_settings 
      SET is_active = false, 
          is_completed = true,
          completed_at = NOW()
      WHERE is_active = true;
    `;
    await client.query(completeDraftQuery);

    // 2. Make results public
    const makeResultsPublicQuery = `
      UPDATE actual_results 
      SET is_public = true 
      WHERE draft_id = (SELECT id FROM draft_settings WHERE is_completed = true);
    `;
    await client.query(makeResultsPublicQuery);

    await client.query('COMMIT');
    logger.info('Results released successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error releasing results:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'update-leaderboard':
    updateLeaderboard()
      .then(() => process.exit(0))
      .catch((error) => {
        logger.error('Failed to update leaderboard:', error);
        process.exit(1);
      });
    break;

  case 'release-results':
    releaseResults()
      .then(() => process.exit(0))
      .catch((error) => {
        logger.error('Failed to release results:', error);
        process.exit(1);
      });
    break;

  default:
    console.log('Usage: node manage-post-draft.js [update-leaderboard|release-results]');
    process.exit(1);
} 