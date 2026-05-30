const db = require('../utils/db')

const Destination = {
  async findAll({ search, category, featured, limit = 20, offset = 0 }) {
    const conditions = []
    const params = []
    let i = 1

    if (search) {
      conditions.push(`(d.name ILIKE $${i} OR d.country ILIKE $${i} OR d.description ILIKE $${i})`)
      params.push(`%${search}%`)
      i++
    }
    if (category) {
      conditions.push(`d.category = $${i}`)
      params.push(category)
      i++
    }
    if (featured) {
      conditions.push(`d.featured = true`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const countResult = await db.query(
      `SELECT COUNT(*) FROM destinations d ${where}`,
      params
    )

    params.push(limit, offset)
    const { rows } = await db.query(
      `SELECT d.*, ROUND(AVG(r.rating), 1) as rating, COUNT(r.id) as review_count
       FROM destinations d
       LEFT JOIN reviews r ON r.destination_id = d.id
       ${where}
       GROUP BY d.id
       ORDER BY d.featured DESC, d.name ASC
       LIMIT $${i} OFFSET $${i + 1}`,
      params
    )

    return { destinations: rows, total: parseInt(countResult.rows[0].count, 10) }
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT d.*, ROUND(AVG(r.rating), 1) as rating, COUNT(r.id) as review_count
       FROM destinations d
       LEFT JOIN reviews r ON r.destination_id = d.id
       WHERE d.id = $1
       GROUP BY d.id`,
      [id]
    )
    return rows[0] || null
  },

  async create(data) {
    const { name, country, description, image_url, category, best_season, price_level, featured } = data
    const { rows } = await db.query(
      `INSERT INTO destinations (name, country, description, image_url, category, best_season, price_level, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, country, description, image_url, category, best_season, price_level, featured ?? false]
    )
    return rows[0]
  },

  async update(id, data) {
    const fields = Object.keys(data)
    const values = Object.values(data)
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ')
    const { rows } = await db.query(
      `UPDATE destinations SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    )
    return rows[0] || null
  },

  async delete(id) {
    const { rowCount } = await db.query('DELETE FROM destinations WHERE id = $1', [id])
    return rowCount > 0
  },
}

module.exports = Destination
