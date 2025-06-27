const pool = require('../config/database');

class Team {
  static async findAll() {
    const query = `
      SELECT * FROM teams
      ORDER BY original_pick_order ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT * FROM teams
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Team; 