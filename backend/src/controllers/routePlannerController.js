const db = require('../utils/db')

// GET /api/routes — public routes + user's own (private included)
const getRoutes = async (req, res, next) => {
  try {
    const userId = req.user?.id ?? null
    const { page = 1, limit = 12, mine = 'false' } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    let where, params
    if (mine === 'true' && userId) {
      where = 'WHERE r.user_id = $1'
      params = [userId, limitNum, offset]
    } else {
      where = userId
        ? 'WHERE (r.is_public = TRUE OR r.user_id = $1)'
        : 'WHERE r.is_public = TRUE'
      params = userId ? [userId, limitNum, offset] : [limitNum, offset]
    }

    const limitIndex = params.length - 1
    const offsetIndex = params.length

    const { rows: routes } = await db.query(
      `SELECT r.id, r.title, r.description, r.cover_image, r.duration_days,
              r.stops, r.transport, r.budget_min, r.budget_max, r.is_public,
              r.tags, r.view_count, r.created_at, r.updated_at,
              u.id as author_id, u.name as author_name
       FROM travel_routes r
       LEFT JOIN users u ON u.id = r.user_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      params
    )

    const countParams = params.slice(0, -2)
    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) FROM travel_routes r ${where}`,
      countParams
    )

    res.json({ routes, total: parseInt(count), page: pageNum, limit: limitNum })
  } catch (err) {
    next(err)
  }
}

// GET /api/routes/:id
const getRoute = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user?.id ?? null

    const { rows: [route] } = await db.query(
      `SELECT r.*, u.name as author_name
       FROM travel_routes r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.id = $1 AND (r.is_public = TRUE OR r.user_id = $2)`,
      [parseInt(id), userId]
    )

    if (!route) return res.status(404).json({ message: 'Route not found' })

    // Increment view count
    db.query('UPDATE travel_routes SET view_count = view_count + 1 WHERE id = $1', [parseInt(id)])

    res.json({ route })
  } catch (err) {
    next(err)
  }
}

// POST /api/routes
const createRoute = async (req, res, next) => {
  try {
    const {
      title, description, cover_image, duration_days = 1,
      stops = [], transport = 'mixed', budget_min, budget_max,
      is_public = true, tags = [],
    } = req.body

    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' })

    const { rows: [route] } = await db.query(
      `INSERT INTO travel_routes
         (user_id, title, description, cover_image, duration_days, stops, transport,
          budget_min, budget_max, is_public, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        req.user.id, title.trim(), description, cover_image,
        parseInt(duration_days), JSON.stringify(stops), transport,
        budget_min || null, budget_max || null, is_public,
        tags,
      ]
    )

    res.status(201).json({ route })
  } catch (err) {
    next(err)
  }
}

// PUT /api/routes/:id
const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params

    const { rows: [existing] } = await db.query(
      'SELECT id, user_id FROM travel_routes WHERE id = $1',
      [parseInt(id)]
    )
    if (!existing) return res.status(404).json({ message: 'Route not found' })
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const allowed = ['title', 'description', 'cover_image', 'duration_days', 'stops', 'transport', 'budget_min', 'budget_max', 'is_public', 'tags']
    const updates = []
    const params = []

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        const val = (key === 'stops') ? JSON.stringify(req.body[key]) : req.body[key]
        params.push(val)
        updates.push(`${key} = $${params.length}`)
      }
    }

    if (!updates.length) return res.status(400).json({ message: 'Nothing to update' })

    params.push(parseInt(id))
    const { rows: [route] } = await db.query(
      `UPDATE travel_routes SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING *`,
      params
    )

    res.json({ route })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/routes/:id
const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params

    const { rows: [existing] } = await db.query(
      'SELECT user_id FROM travel_routes WHERE id = $1',
      [parseInt(id)]
    )
    if (!existing) return res.status(404).json({ message: 'Route not found' })
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await db.query('DELETE FROM travel_routes WHERE id = $1', [parseInt(id)])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { getRoutes, getRoute, createRoute, updateRoute, deleteRoute }
