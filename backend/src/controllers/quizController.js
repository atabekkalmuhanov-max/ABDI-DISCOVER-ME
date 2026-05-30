const db = require('../utils/db')

const QUESTION_LABELS = {
  budget: { budget: 'Budget ($0–500)', midrange: 'Mid-range ($500–2000)', premium: 'Premium ($2000–5000)', luxury: 'Luxury ($5000+)' },
  duration: { weekend: '2–3 days', short: '4–6 days', week: '7–10 days', extended: '10+ days' },
  climate: { hot: 'Hot & Sunny', mild: 'Mild & Temperate', cool: 'Cool & Mountainous', any: 'No preference' },
  interest: { history: 'Historical & Cultural', nature: 'Nature & Landscapes', adventure: 'Adventure & Sports', mixed: 'Mix of everything' },
  group: { solo: 'Solo traveler', couple: 'Couple', family: 'Family with children', friends: 'Group of friends' },
  comfort: { economy: 'Economy (hostels/budget hotels)', comfort: 'Comfort (3-star hotels)', luxury: 'Luxury (4–5 star hotels)' },
  adventure: { low: 'Relaxed (sightseeing, cafes)', moderate: 'Moderate (hiking, cycling)', high: 'Thrilling (extreme sports, trekking)' },
}

const buildPrompt = (answers) => {
  const lines = Object.entries(answers).map(([key, val]) => {
    const label = QUESTION_LABELS[key]?.[val] || val
    return `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${label}`
  })

  return `You are an expert travel advisor for Uzbekistan. A traveler completed a travel preferences quiz with the following answers:

${lines.join('\n')}

Based on these preferences, recommend 4–5 destinations in Uzbekistan. For each destination, explain specifically why it matches their answers.

Respond with a JSON array only — no markdown, no explanation outside the array:
[
  {
    "name": "Destination Name",
    "category": "Category (e.g. Historical, Nature, Adventure)",
    "description": "2–3 sentences about this place.",
    "why": "Why this matches the traveler's quiz answers (1–2 sentences).",
    "best_time": "Best time to visit",
    "budget_fit": "How well it fits their budget (1 sentence)"
  }
]`
}

const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body
    const userId = req.user.id

    const required = ['budget', 'duration', 'climate', 'interest', 'group', 'comfort', 'adventure']
    for (const key of required) {
      if (!answers?.[key]) {
        return res.status(400).json({ message: `Missing answer for: ${key}` })
      }
    }

    // Fetch destinations for context
    const { rows: destinations } = await db.query(
      `SELECT name, category, description, best_season, price_level
       FROM destinations
       ORDER BY featured DESC, RANDOM()
       LIMIT 25`
    )

    let recommendations

    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk')
      const client = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

      const destContext = destinations
        .map((d) => `- ${d.name} (${d.category || 'Cultural'}, price level ${d.price_level || 2}/3): ${d.description?.slice(0, 100) || ''}`)
        .join('\n')

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `${buildPrompt(answers)}\n\nAvailable destinations in Uzbekistan:\n${destContext}`,
          },
        ],
      })

      const text = message.content[0].text.trim()
      try {
        const match = text.match(/\[[\s\S]*\]/)
        recommendations = match ? JSON.parse(match[0]) : JSON.parse(text)
      } catch {
        recommendations = [{ name: 'AI Response', description: text, why: '', category: 'General', best_time: '' }]
      }
    } else {
      // Fallback without API key
      recommendations = destinations.slice(0, 5).map((d) => ({
        name: d.name,
        category: d.category || 'Cultural',
        description: d.description || `${d.name} is a remarkable destination in Uzbekistan.`,
        why: 'Recommended based on your travel preferences.',
        best_time: d.best_season || 'Spring (April–May) and Autumn (September–October)',
        budget_fit: 'Suitable for various budgets.',
      }))
    }

    // Save to PostgreSQL
    await db.query(
      'INSERT INTO quiz_results (user_id, answers, recommendations) VALUES ($1, $2, $3)',
      [userId, JSON.stringify(answers), JSON.stringify(recommendations)]
    )

    res.json({ recommendations, answers })
  } catch (err) {
    next(err)
  }
}

const getQuizHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, answers, recommendations, created_at FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    )
    res.json({ history: rows })
  } catch (err) {
    next(err)
  }
}

module.exports = { submitQuiz, getQuizHistory }
