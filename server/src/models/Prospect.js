const pool = require('../config/database');

class Prospect {
  static async findAll() {
    const query = `
      SELECT * FROM prospects
      ORDER BY rank ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT * FROM prospects
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async getTop200() {
    const query = `
      SELECT * FROM prospects
      WHERE rank <= 200
      ORDER BY rank ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
}

module.exports = Prospect; 