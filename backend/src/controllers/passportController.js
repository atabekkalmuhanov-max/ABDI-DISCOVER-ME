const db = require('../utils/db')

const ACHIEVEMENTS = [
  { slug: 'first_step',     name: 'First Step',        description: 'Visit your first destination',                                  icon: '👣',  points: 50,  type: 'visits',    threshold: 1  },
  { slug: 'explorer_5',    name: 'Explorer',           description: 'Visit 5 destinations',                                          icon: '🧭',  points: 100, type: 'visits',    threshold: 5  },
  { slug: 'adventurer_10', name: 'Adventurer',         description: 'Visit 10 destinations',                                         icon: '🏔️', points: 200, type: 'visits',    threshold: 10 },
  { slug: 'seasoned_20',   name: 'Seasoned Traveler',  description: 'Visit 20 destinations',                                         icon: '🎒',  points: 300, type: 'visits',    threshold: 20 },
  { slug: 'region_3',      name: 'Region Collector',   description: 'Explore 3 different regions of Uzbekistan',                    icon: '🗺️', points: 150, type: 'regions',   threshold: 3  },
  { slug: 'region_7',      name: 'Region Master',      description: 'Explore 7 different regions of Uzbekistan',                    icon: '🏅',  points: 300, type: 'regions',   threshold: 7  },
  { slug: 'critic',        name: 'Travel Critic',      description: 'Write your first destination review',                           icon: '✍️', points: 50,  type: 'reviews',   threshold: 1  },
  { slug: 'expert_critic', name: 'Expert Critic',      description: 'Write 10 destination reviews',                                  icon: '⭐',  points: 150, type: 'reviews',   threshold: 10 },
  { slug: 'hidden_seeker', name: 'Hidden Gem Seeker',  description: 'Use the Hidden Places feature to discover obscure locations',   icon: '🔮',  points: 100, type: 'feature',   feature: 'hidden' },
  { slug: 'quiz_champ',    name: 'Quiz Champion',      description: 'Complete a travel personality quiz',                            icon: '🏆',  points: 75,  type: 'feature',   feature: 'quiz'   },
  { slug: 'ai_explorer',   name: 'AI Explorer',        description: 'Receive personalized AI travel recommendations',                icon: '🤖',  points: 75,  type: 'feature',   feature: 'ai'     },
  { slug: 'silk_road',     name: 'Silk Road Trail',    description: 'Visit Samarkand, Bukhara and Khorezm — the ancient Silk Road', icon: '🏺',  points: 250, type: 'silk_road'              },
]

const REGION_INFO = {
  'Tashkent':       { badgeName: 'Capital Explorer',    icon: '🏛️', color: 'blue'    },
  'Samarkand':      { badgeName: 'Blue Dome Seeker',    icon: '🕌',  color: 'indigo'  },
  'Bukhara':        { badgeName: 'Ancient City Walker', icon: '🏰',  color: 'amber'   },
  'Khorezm':        { badgeName: 'Khivan Adventurer',   icon: '🌿',  color: 'emerald' },
  'Fergana':        { badgeName: 'Valley Wanderer',     icon: '🌸',  color: 'pink'    },
  'Andijan':        { badgeName: 'Eastern Explorer',    icon: '🌄',  color: 'orange'  },
  'Namangan':       { badgeName: 'Garden City Visitor', icon: '🌺',  color: 'rose'    },
  'Kashkadarya':    { badgeName: 'Southern Pathfinder', icon: '🏜️', color: 'yellow'  },
  'Surkhandarya':   { badgeName: 'Desert Daredevil',    icon: '🦅',  color: 'red'     },
  'Jizzakh':        { badgeName: 'Steppe Roamer',       icon: '🌾',  color: 'lime'    },
  'Sirdaryo':       { badgeName: 'River Wanderer',      icon: '🌊',  color: 'cyan'    },
  'Navoi':          { badgeName: 'Desert Star',         icon: '⭐',  color: 'purple'  },
  'Karakalpakstan': { badgeName: 'Aral Sea Legend',     icon: '🚢',  color: 'teal'    },
}

const LEVELS = [
  { level: 0, name: 'Curious Wanderer',  minPoints: 0    },
  { level: 1, name: 'Novice Explorer',   minPoints: 100  },
  { level: 2, name: 'Adventurer',        minPoints: 300  },
  { level: 3, name: 'Seasoned Traveler', minPoints: 600  },
  { level: 4, name: 'Region Master',     minPoints: 1000 },
  { level: 5, name: 'Uzbekistan Expert', minPoints: 1500 },
]

function computeLevel(points) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (points >= lvl.minPoints) current = lvl
  }
  const idx = LEVELS.indexOf(current)
  return { ...current, nextLevel: LEVELS[idx + 1] || null }
}

const getPassport = async (req, res, next) => {
  try {
    const userId = req.user.id

    const [visitsRes, reviewsRes, hiddenRes, quizRes, aiRes, regionTotalsRes] = await Promise.all([
      db.query(
        `SELECT pv.id, pv.destination_id, pv.visited_at, pv.notes,
                d.name, d.region, d.image_url, d.category
         FROM passport_visits pv
         JOIN destinations d ON d.id = pv.destination_id
         WHERE pv.user_id = $1
         ORDER BY pv.visited_at DESC`,
        [userId]
      ),
      db.query(`SELECT COUNT(*) FROM reviews WHERE user_id = $1`, [userId]),
      db.query(`SELECT COUNT(*) FROM hidden_places_discoveries WHERE user_id = $1`, [userId]),
      db.query(`SELECT COUNT(*) FROM quiz_results WHERE user_id = $1`, [userId]),
      db.query(`SELECT COUNT(*) FROM ai_story_history WHERE user_id = $1`, [userId]),
      db.query(
        `SELECT region, COUNT(*) AS total
         FROM destinations
         WHERE region IS NOT NULL AND region != ''
         GROUP BY region
         ORDER BY region`
      ),
    ])

    const visits        = visitsRes.rows
    const reviewsCount  = parseInt(reviewsRes.rows[0].count)
    const hiddenCount   = parseInt(hiddenRes.rows[0].count)
    const quizCount     = parseInt(quizRes.rows[0].count)
    const aiCount       = parseInt(aiRes.rows[0].count)
    const regionTotals  = regionTotalsRes.rows

    const visitCount      = visits.length
    const visitedRegions  = [...new Set(visits.map(v => v.region).filter(Boolean))]
    const regionCount     = visitedRegions.length

    const silkRoadKeys = ['samarkand', 'bukhara', 'khorezm']
    const hasSilkRoad  = silkRoadKeys.every(k => visitedRegions.some(r => r.toLowerCase().includes(k)))

    const achievements = ACHIEVEMENTS.map(a => {
      let earned = false
      switch (a.type) {
        case 'visits':    earned = visitCount    >= a.threshold; break
        case 'regions':   earned = regionCount   >= a.threshold; break
        case 'reviews':   earned = reviewsCount  >= a.threshold; break
        case 'feature':
          if (a.feature === 'hidden') earned = hiddenCount > 0
          if (a.feature === 'quiz')   earned = quizCount   > 0
          if (a.feature === 'ai')     earned = aiCount     > 0
          break
        case 'silk_road': earned = hasSilkRoad; break
      }
      return { ...a, earned }
    })

    const visitPoints       = visitCount     * 50
    const reviewPoints      = reviewsCount   * 30
    const regionPoints      = regionCount    * 100
    const achievementPoints = achievements.filter(a => a.earned).reduce((s, a) => s + a.points, 0)
    const totalPoints       = visitPoints + reviewPoints + regionPoints + achievementPoints

    const levelInfo = computeLevel(totalPoints)

    const regionBadges = visitedRegions.map(region => {
      const info = REGION_INFO[region] || { badgeName: `${region} Explorer`, icon: '📍', color: 'gray' }
      return {
        region,
        ...info,
        visitCount: visits.filter(v => v.region === region).length,
      }
    })

    const regionProgress = regionTotals.map(({ region, total }) => {
      const visitedInRegion = visits.filter(v => v.region === region).length
      const info = REGION_INFO[region] || { icon: '📍', color: 'gray' }
      return {
        region,
        icon:       info.icon,
        color:      info.color,
        visited:    visitedInRegion,
        total:      parseInt(total),
        percentage: Math.round((visitedInRegion / parseInt(total)) * 100),
        hasVisited: visitedInRegion > 0,
      }
    })

    const totalDestinations    = regionTotals.reduce((s, r) => s + parseInt(r.total), 0)
    const completionPercentage = totalDestinations > 0
      ? Math.round((visitCount / totalDestinations) * 100)
      : 0

    res.json({
      level:               levelInfo.level,
      levelName:           levelInfo.name,
      nextLevel:           levelInfo.nextLevel,
      totalPoints,
      visitCount,
      regionCount,
      reviewCount:         reviewsCount,
      regionBadges,
      regionProgress,
      achievements,
      recentVisits:        visits.slice(0, 10),
      completionPercentage,
    })
  } catch (err) {
    next(err)
  }
}

const markVisited = async (req, res, next) => {
  try {
    const { destinationId, notes } = req.body
    if (!destinationId) return res.status(400).json({ message: 'destinationId is required' })

    const { rows: [dest] } = await db.query(
      `SELECT id, name, region FROM destinations WHERE id = $1`,
      [destinationId]
    )
    if (!dest) return res.status(404).json({ message: 'Destination not found' })

    const { rows: [visit] } = await db.query(
      `INSERT INTO passport_visits (user_id, destination_id, notes)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, destination_id) DO UPDATE
         SET visited_at = NOW(), notes = EXCLUDED.notes
       RETURNING id, destination_id, visited_at, notes`,
      [req.user.id, destinationId, notes || null]
    )

    res.json({ visit, destination: dest })
  } catch (err) {
    next(err)
  }
}

const unmarkVisited = async (req, res, next) => {
  try {
    const { destinationId } = req.params
    await db.query(
      `DELETE FROM passport_visits WHERE user_id = $1 AND destination_id = $2`,
      [req.user.id, parseInt(destinationId)]
    )
    res.json({ message: 'Removed from passport' })
  } catch (err) {
    next(err)
  }
}

const getVisitedIds = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT destination_id FROM passport_visits WHERE user_id = $1`,
      [req.user.id]
    )
    res.json({ visitedIds: rows.map(r => r.destination_id) })
  } catch (err) {
    next(err)
  }
}

module.exports = { getPassport, markVisited, unmarkVisited, getVisitedIds }
