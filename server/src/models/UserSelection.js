const pool = require('../config/database');

class UserSelection {
  static async findByUserId(userId) {
    const query = `
      SELECT 
        us.*,
        t.name as team_name,
        p.name as player_name,
        p.position
      FROM user_selections us
      LEFT JOIN teams t ON us.team_id = t.id
      LEFT JOIN prospects p ON us.player_id = p.id
      WHERE us.user_id = $1
      ORDER BY us.pick_number ASC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async create(data) {
    const { user_id, team_id, player_id, pick_number } = data;
    const query = `
      INSERT INTO user_selections (user_id, team_id, player_id, pick_number)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [user_id, team_id, player_id, pick_number]);
    return rows[0];
  }

  static async update(id, data) {
    // Build the SET clause dynamically based on provided fields
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (data.team_id !== undefined) {
      setClauses.push(`team_id = $${paramCount}`);
      values.push(data.team_id);
      paramCount++;
    }
    if (data.player_id !== undefined) {
      setClauses.push(`player_id = $${paramCount}`);
      values.push(data.player_id);
      paramCount++;
    }
    if (data.player_name !== undefined) {
      setClauses.push(`player_name = $${paramCount}`);
      values.push(data.player_name);
      paramCount++;
    }
    if (data.position !== undefined) {
      setClauses.push(`position = $${paramCount}`);
      values.push(data.position);
      paramCount++;
    }
    if (data.confirmed !== undefined) {
      setClauses.push(`confirmed = $${paramCount}`);
      values.push(data.confirmed);
      paramCount++;
    }
    if (data.trade !== undefined) {
      setClauses.push(`trade = $${paramCount}`);
      values.push(data.trade);
      paramCount++;
    }

    if (setClauses.length === 0) {
      throw new Error('No fields to update');
    }

    // Add the id as the last parameter
    values.push(id);

    const query = `
      UPDATE user_selections
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT 
        us.*,
        t.name as team_name,
        p.name as player_name,
        p.position
      FROM user_selections us
      LEFT JOIN teams t ON us.team_id = t.id
      LEFT JOIN prospects p ON us.player_id = p.id
      WHERE us.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = UserSelection; 