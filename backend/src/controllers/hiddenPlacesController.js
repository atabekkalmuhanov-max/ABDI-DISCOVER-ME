const db = require('../utils/db')

const TRAVELER_TYPES = ['solo', 'couple', 'family', 'adventurer', 'photographer', 'historian']
const EXPERIENCE_TYPES = ['nature', 'culture', 'history', 'spiritual', 'food', 'architecture', 'adventure', 'village life']

const discover = async (req, res, next) => {
  try {
    const {
      travelerType = 'solo',
      experiences = [],
      rarityLevel = 70,   // 1-100: how hidden (higher = more obscure)
      region = 'any',
      transportMode = 'any', // car, public, walking, any
      excludeIds = [],
    } = req.body

    if (experiences.length === 0) {
      return res.status(400).json({ message: 'Select at least one experience type' })
    }

    // Pull non-featured destinations as local context
    const regionFilter = region !== 'any' ? 'AND region = $1' : ''
    const regionParams = region !== 'any' ? [region] : []

    const { rows: destinations } = await db.query(
      `SELECT id, name, region, description, category, tags, highlights, lat, lng
       FROM destinations
       WHERE featured = FALSE ${regionFilter}
       ORDER BY RANDOM()
       LIMIT 30`,
      regionParams
    )

    // Save discovery request to history
    const userId = req.user?.id ?? null
    let discoveryId = null
    if (userId) {
      const { rows: [rec] } = await db.query(
        `INSERT INTO hidden_places_discoveries (user_id, traveler_type, experiences, rarity_level, region, transport_mode)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, travelerType, JSON.stringify(experiences), rarityLevel, region, transportMode]
      )
      discoveryId = rec.id
    }

    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk')
      const client = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

      const destContext = destinations
        .map((d) => `- ${d.name} (${d.region || 'Uzbekistan'}): ${d.description?.slice(0, 120) || 'A lesser-known gem'}`)
        .join('\n')

      const excludedNames = excludeIds.length ? `\nDo NOT suggest destinations with these IDs: ${excludeIds.join(', ')}` : ''

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        messages: [
          {
            role: 'user',
            content: `You are a deep-local expert on hidden and undiscovered places in Uzbekistan — someone who has spent decades traveling off the beaten path. Your mission is to surface truly obscure, rarely-visited destinations that mainstream travel guides completely ignore.

Traveler profile:
- Type: ${travelerType}
- Seeking: ${experiences.join(', ')}
- Rarity preference: ${rarityLevel}/100 (${rarityLevel >= 80 ? 'extremely hidden, barely known even to locals' : rarityLevel >= 60 ? 'off-the-beaten-path, visited by very few tourists' : 'somewhat hidden, popular with curious locals but ignored by tour operators'})
- Region: ${region === 'any' ? 'anywhere in Uzbekistan' : region}
- Transport: ${transportMode === 'any' ? 'flexible' : transportMode}
${excludedNames}

Known (less popular) destinations you may reference for context:
${destContext}

Generate 5 hidden gem recommendations. These should be GENUINELY obscure — ancient ruins tourists walk past, forgotten caravanserai courtyards, a teahouse run by a 90-year-old craftsman, a spring that locals use for healing, a canyon that doesn't appear on any map. Prioritize the unusual.

Return ONLY a JSON array with this exact structure:
[
  {
    "name": "Place name in English",
    "localName": "Name in Uzbek/local script if known",
    "region": "Region or city in Uzbekistan",
    "category": "One of: nature|history|spiritual|village|food|architecture|adventure",
    "hiddenScore": <number 1-100 representing how unknown this place is>,
    "description": "2-3 sentences vividly describing the place",
    "secretTip": "The single insider tip that makes visiting this place special — something most visitors would never discover",
    "whyHidden": "1 sentence explaining why mainstream tourism ignores this place",
    "bestTime": "Best time of day or year to visit",
    "howToGet": "Practical directions from the nearest city",
    "highlights": ["highlight 1", "highlight 2", "highlight 3"],
    "approxLat": <approximate latitude as number or null>,
    "approxLng": <approximate longitude as number or null>
  }
]`,
          },
        ],
      })

      let places
      try {
        const text = message.content[0].text.trim()
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        places = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
      } catch {
        places = []
      }

      // Persist result
      if (discoveryId) {
        await db.query(
          `UPDATE hidden_places_discoveries SET result = $1 WHERE id = $2`,
          [JSON.stringify(places), discoveryId]
        )
      }

      return res.json({ places, discoveryId })
    }

    // Fallback without API key
    const fallback = destinations.slice(0, 5).map((d) => ({
      name: d.name,
      localName: null,
      region: d.region || 'Uzbekistan',
      category: d.category || 'culture',
      hiddenScore: Math.floor(60 + Math.random() * 35),
      description: d.description || `${d.name} is a lesser-known destination with remarkable character.`,
      secretTip: 'Visit early in the morning before tour groups arrive.',
      whyHidden: 'This place is rarely featured in mainstream travel itineraries.',
      bestTime: 'Spring (April–May) and Autumn (September–October)',
      howToGet: `Accessible from the nearest city by shared taxi or private car.`,
      highlights: d.highlights || ['Local culture', 'Historical significance', 'Scenic beauty'],
      approxLat: d.lat ? parseFloat(d.lat) : null,
      approxLng: d.lng ? parseFloat(d.lng) : null,
    }))

    if (discoveryId) {
      await db.query(
        `UPDATE hidden_places_discoveries SET result = $1 WHERE id = $2`,
        [JSON.stringify(fallback), discoveryId]
      )
    }

    res.json({ places: fallback, discoveryId })
  } catch (err) {
    next(err)
  }
}

const getHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, traveler_type, experiences, rarity_level, region, result, created_at
       FROM hidden_places_discoveries
       WHERE user_id = $1 AND result IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user.id]
    )
    res.json({ history: rows })
  } catch (err) {
    next(err)
  }
}

module.exports = { discover, getHistory }
