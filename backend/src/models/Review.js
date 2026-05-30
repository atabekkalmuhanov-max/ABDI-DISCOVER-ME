const db = require('../utils/db')

const Review = {
  async findByDestination(destinationId) {
    const { rows } = await db.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.destination_id = $1
       ORDER BY r.created_at DESC`,
      [destinationId]
    )
    return rows
  },

  async create({ destination_id, user_id, rating, comment }) {
    const { rows } = await db.query(
      `INSERT INTO reviews (destination_id, user_id, rating, comment)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [destination_id, user_id, rating, comment]
    )
    return rows[0]
  },

  async delete(id, userId) {
    const { rowCount } = await db.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    return rowCount > 0
  },
}

module.exports = Review
