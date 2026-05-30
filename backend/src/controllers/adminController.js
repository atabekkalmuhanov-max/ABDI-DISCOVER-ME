const db = require('../utils/db')

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [usersRes, destsRes, revsRes, routesRes, sessionsRes, visitsRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM destinations'),
      db.query('SELECT COUNT(*) FROM reviews'),
      db.query('SELECT COUNT(*) FROM travel_routes'),
      db.query('SELECT COUNT(*) FROM chat_sessions'),
      db.query('SELECT COUNT(*) FROM passport_visits'),
    ])

    const { rows: recentUsers } = await db.query(
      `SELECT id, name, email, role, is_active, is_verified, created_at
       FROM users ORDER BY created_at DESC LIMIT 5`
    )

    const { rows: roleBreakdown } = await db.query(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC`
    )

    const { rows: topDestinations } = await db.query(
      `SELECT d.id, d.name, d.region, COUNT(pv.id) as visit_count
       FROM destinations d
       LEFT JOIN passport_visits pv ON pv.destination_id = d.id
       GROUP BY d.id, d.name, d.region
       ORDER BY visit_count DESC LIMIT 5`
    )

    res.json({
      stats: {
        users: parseInt(usersRes.rows[0].count),
        destinations: parseInt(destsRes.rows[0].count),
        reviews: parseInt(revsRes.rows[0].count),
        routes: parseInt(routesRes.rows[0].count),
        chatSessions: parseInt(sessionsRes.rows[0].count),
        passportVisits: parseInt(visitsRes.rows[0].count),
      },
      recentUsers,
      roleBreakdown,
      topDestinations,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    const conditions = ['1=1']
    const params = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`)
    }
    if (role) {
      params.push(role)
      conditions.push(`role = $${params.length}`)
    }

    const where = `WHERE ${conditions.join(' AND ')}`
    const countParams = [...params]

    params.push(limitNum, offset)

    const { rows: users } = await db.query(
      `SELECT id, name, email, role, is_active, is_verified, country, created_at, last_login_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) FROM users ${where}`,
      countParams
    )

    res.json({ users, total: parseInt(count), page: pageNum, limit: limitNum })
  } catch (err) {
    next(err)
  }
}

// PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { role, is_active } = req.body

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot modify your own account' })
    }

    const updates = []
    const params = []
    if (role !== undefined) {
      params.push(role); updates.push(`role = $${params.length}`)
    }
    if (is_active !== undefined) {
      params.push(is_active); updates.push(`is_active = $${params.length}`)
    }

    if (!updates.length) return res.status(400).json({ message: 'Nothing to update' })

    params.push(parseInt(id))
    const { rows: [user] } = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}
       RETURNING id, name, email, role, is_active`,
      params
    )

    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }
    await db.query('DELETE FROM users WHERE id = $1', [parseInt(id)])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/destinations
const getDestinations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    const conditions = ['1=1']
    const params = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(name ILIKE $${params.length} OR region ILIKE $${params.length})`)
    }

    const where = `WHERE ${conditions.join(' AND ')}`
    const countParams = [...params]
    params.push(limitNum, offset)

    const { rows: destinations } = await db.query(
      `SELECT id, name, country, category, region, featured, price_level, created_at
       FROM destinations ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) FROM destinations ${where}`,
      countParams
    )

    res.json({ destinations, total: parseInt(count), page: pageNum, limit: limitNum })
  } catch (err) {
    next(err)
  }
}

// POST /api/admin/destinations
const createDestination = async (req, res, next) => {
  try {
    const {
      name, country = 'Uzbekistan', description, image_url,
      category, best_season, price_level, region, featured = false,
      lat, lng,
    } = req.body

    if (!name) return res.status(400).json({ message: 'Name is required' })

    const { rows: [dest] } = await db.query(
      `INSERT INTO destinations
         (name, country, description, image_url, category, best_season, price_level, region, featured, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [name, country, description, image_url, category, best_season, price_level, region, featured, lat, lng]
    )
    res.status(201).json({ destination: dest })
  } catch (err) {
    next(err)
  }
}

// PUT /api/admin/destinations/:id
const updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params
    const allowed = ['name', 'description', 'image_url', 'category', 'best_season', 'price_level', 'region', 'featured', 'lat', 'lng']
    const updates = []
    const params = []

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        params.push(req.body[key])
        updates.push(`${key} = $${params.length}`)
      }
    }

    if (!updates.length) return res.status(400).json({ message: 'Nothing to update' })

    params.push(parseInt(id))
    const { rows: [dest] } = await db.query(
      `UPDATE destinations SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING *`,
      params
    )

    if (!dest) return res.status(404).json({ message: 'Destination not found' })
    res.json({ destination: dest })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/admin/destinations/:id
const deleteDestination = async (req, res, next) => {
  try {
    await db.query('DELETE FROM destinations WHERE id = $1', [parseInt(req.params.id)])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/reviews
const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    const { rows } = await db.query(
      `SELECT r.id, r.destination_id, r.rating, r.comment, r.created_at,
              u.id as user_id, u.name as user_name, u.email as user_email
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limitNum, offset]
    )

    const { rows: [{ count }] } = await db.query('SELECT COUNT(*) FROM reviews')

    res.json({ reviews: rows, total: parseInt(count), page: pageNum, limit: limitNum })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/admin/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    await db.query('DELETE FROM reviews WHERE id = $1', [parseInt(req.params.id)])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getStats,
  getUsers, updateUser, deleteUser,
  getDestinations, createDestination, updateDestination, deleteDestination,
  getReviews, deleteReview,
}
