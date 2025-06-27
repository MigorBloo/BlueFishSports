const pool = require('../config/database');

class DraftSettings {
  static async getLockDate() {
    try {
      const result = await pool.query(
        'SELECT lock_date FROM draft_settings ORDER BY id DESC LIMIT 1'
      );
      return result.rows[0]?.lock_date || null;
    } catch (error) {
      console.error('Error getting lock date:', error);
      throw error;
    }
  }

  static async setLockDate(lockDate) {
    try {
      const result = await pool.query(
        'INSERT INTO draft_settings (lock_date) VALUES ($1) RETURNING *',
        [lockDate]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error setting lock date:', error);
      throw error;
    }
  }
}

module.exports = DraftSettings; 