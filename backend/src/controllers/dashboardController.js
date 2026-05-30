const db = require('../utils/db')

const getStats = async (req, res, next) => {
  try {
    const [destResult, reviewResult, featuredResult, userReviewResult] = await Promise.all([
      db.query('SELECT COUNT(*) FROM destinations'),
      db.query('SELECT COUNT(*) FROM reviews'),
      db.query('SELECT COUNT(*) FROM destinations WHERE featured = true'),
      db.query('SELECT COUNT(*) FROM reviews WHERE user_id = $1', [req.user.id]),
    ])

    res.json({
      total_destinations: parseInt(destResult.rows[0].count, 10),
      total_reviews: parseInt(reviewResult.rows[0].count, 10),
      featured_count: parseInt(featuredResult.rows[0].count, 10),
      user_reviews: parseInt(userReviewResult.rows[0].count, 10),
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getStats }
