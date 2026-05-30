const db = require('../utils/db')

const getRecommendations = async (req, res, next) => {
  try {
    const { prompt, interests = [] } = req.body
    if (!prompt && interests.length === 0) {
      return res.status(400).json({ message: 'Prompt or interests are required' })
    }

    const userPrompt = prompt || interests.join(', ')

    // Fetch destinations for context
    const { rows: destinations } = await db.query(
      `SELECT id, name, country, description, category, best_season, price_level
       FROM destinations
       ORDER BY featured DESC, RANDOM()
       LIMIT 20`
    )

    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk')
      const client = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

      const destinationContext = destinations
        .map((d) => `- ${d.name} (${d.category || 'Cultural'}): ${d.description?.slice(0, 100) || 'Beautiful destination in Uzbekistan'}`)
        .join('\n')

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `You are an expert travel advisor for Uzbekistan. Based on the traveler's preferences below, recommend 4-5 destinations from the provided list, explaining why each one matches their interests.

Traveler preferences: "${userPrompt}"

Available destinations in Uzbekistan:
${destinationContext}

Respond with a JSON array of recommendations in this exact format:
[
  {
    "name": "Destination Name",
    "category": "Category",
    "description": "2-3 sentences about this place",
    "why": "Why this destination matches the traveler's preferences (1-2 sentences)",
    "best_time": "Best time to visit"
  }
]

Only return the JSON array, no other text.`,
          },
        ],
      })

      let recommendations
      try {
        const text = message.content[0].text.trim()
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
      } catch {
        recommendations = message.content[0].text
      }

      return res.json({ recommendations })
    }

    // Fallback: return curated destinations from DB when no API key
    const fallback = destinations.slice(0, 5).map((d) => ({
      name: d.name,
      category: d.category || 'Cultural',
      destination_id: d.id,
      description: d.description || `${d.name} is one of Uzbekistan's most remarkable destinations, offering a rich blend of history and culture.`,
      why: 'This destination is highly recommended based on its cultural significance and visitor ratings.',
      best_time: d.best_season || 'Spring (April-May) and Autumn (September-October)',
    }))

    res.json({ recommendations: fallback })
  } catch (err) {
    next(err)
  }
}

module.exports = { getRecommendations }
