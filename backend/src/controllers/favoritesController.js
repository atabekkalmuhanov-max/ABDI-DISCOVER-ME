const db = require('../utils/db')

// GET /api/favorites  — returns all favorites with entity details
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { entity_type } = req.query

    let where = 'WHERE f.user_id = $1'
    const params = [userId]

    if (entity_type) {
      params.push(entity_type)
      where += ` AND f.entity_type = $${params.length}`
    }

    const { rows: favorites } = await db.query(
      `SELECT f.id, f.entity_type, f.entity_id, f.created_at
       FROM favorites f
       ${where}
       ORDER BY f.created_at DESC`,
      params
    )

    // Enrich destination favorites with destination details
    const destFavs = favorites.filter(f => f.entity_type === 'destination')
    let destDetails = {}
    if (destFavs.length > 0) {
      const ids = destFavs.map(f => f.entity_id)
      const { rows } = await db.query(
        `SELECT id, name, region, image_url, category, price_level, description
         FROM destinations WHERE id = ANY($1::int[])`,
        [ids]
      )
      rows.forEach(d => { destDetails[d.id] = d })
    }

    const enriched = favorites.map(f => ({
      ...f,
      details: f.entity_type === 'destination' ? (destDetails[f.entity_id] || null) : null,
    }))

    res.json({ favorites: enriched })
  } catch (err) {
    next(err)
  }
}

// GET /api/favorites/ids?entity_type=destination
const getFavoriteIds = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { entity_type = 'destination' } = req.query

    const { rows } = await db.query(
      'SELECT entity_id FROM favorites WHERE user_id = $1 AND entity_type = $2',
      [userId, entity_type]
    )

    res.json({ ids: rows.map(r => r.entity_id) })
  } catch (err) {
    next(err)
  }
}

// POST /api/favorites
const addFavorite = async (req, res, next) => {
  try {
    const { entity_type, entity_id } = req.body

    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: 'entity_type and entity_id are required' })
    }

    const { rows: [fav] } = await db.query(
      `INSERT INTO favorites (user_id, entity_type, entity_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING
       RETURNING *`,
      [req.user.id, entity_type, parseInt(entity_id)]
    )

    res.status(201).json({ favorite: fav || null })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/favorites/:entity_type/:entity_id
const removeFavorite = async (req, res, next) => {
  try {
    const { entity_type, entity_id } = req.params

    await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3',
      [req.user.id, entity_type, parseInt(entity_id)]
    )

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { getFavorites, getFavoriteIds, addFavorite, removeFavorite }
