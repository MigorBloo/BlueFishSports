const pool = require('../config/database');

class ExpertPick {
  static async findAll() {
    const query = `
      SELECT 
        ep.*,
        t.name as team_name,
        p.name as player_name,
        p.position
      FROM expert_picks ep
      LEFT JOIN teams t ON ep.team_id = t.id
      LEFT JOIN prospects p ON ep.player_id = p.id
      ORDER BY ep.pick_number ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findByExpertName(expertName) {
    const query = `
      SELECT 
        ep.*,
        t.name as team_name,
        p.name as player_name,
        p.position
      FROM expert_picks ep
      LEFT JOIN teams t ON ep.team_id = t.id
      LEFT JOIN prospects p ON ep.player_id = p.id
      WHERE ep.expert_name = $1
      ORDER BY ep.pick_number ASC
    `;
    const { rows } = await pool.query(query, [expertName]);
    return rows;
  }

  static async create(data) {
    const { expert_name, team_id, player_id, pick_number } = data;
    const query = `
      INSERT INTO expert_picks (expert_name, team_id, player_id, pick_number)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [expert_name, team_id, player_id, pick_number]);
    return rows[0];
  }
}

module.exports = ExpertPick; 