const db = require('../utils/db')

const LANG_NAMES = {
  en: 'English',
  uz: "O'zbek tili (Uzbek)",
  ru: 'Russian (Русский)',
  kk: 'Qaraqalpaq',
}

const analyzeAttraction = async (req, res, next) => {
  try {
    const { language = 'en' } = req.body

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ message: 'AI service not configured' })
    }

    const imageBase64 = req.file.buffer.toString('base64')
    const mediaType = req.file.mimetype

    const Anthropic = require('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const langName = LANG_NAMES[language] || 'English'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            {
              type: 'text',
              text: `You are an expert cultural and historical guide specializing in world attractions, particularly Central Asian and Uzbekistan heritage sites. Analyze this image and identify the attraction shown.

Respond entirely in ${langName}. Return a JSON object with exactly this structure:
{
  "identified": true,
  "name": "Full official name of the attraction",
  "location": "City, Country",
  "construction_year": "Year or period (e.g. '14th century' or '1404 AD')",
  "architecture_style": "Architectural style in 1–2 sentences",
  "historical_facts": [
    "Historical fact 1",
    "Historical fact 2",
    "Historical fact 3",
    "Historical fact 4",
    "Historical fact 5"
  ],
  "interesting_stories": [
    "Interesting legend or story 1",
    "Interesting legend or story 2",
    "Interesting legend or story 3"
  ],
  "audio_text": "A 150–200 word narration suitable for audio playback, written as if spoken by a tour guide standing at the attraction."
}

If you cannot identify a specific historical attraction or landmark in the image, return:
{
  "identified": false,
  "message": "Could not identify a specific attraction. Please upload a clear photo of a historical site, monument, or landmark."
}

Return only the JSON object, no markdown or extra text.`,
            },
          ],
        },
      ],
    })

    let result
    try {
      const text = message.content[0].text.trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
    } catch {
      return res.status(500).json({ message: 'Failed to parse AI response' })
    }

    if (result.identified !== false && req.user?.id) {
      db.query(
        `INSERT INTO ai_guide_history
           (user_id, attraction_name, location, construction_year, architecture_style, historical_facts, interesting_stories, audio_text, language)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          req.user.id,
          result.name,
          result.location,
          result.construction_year,
          result.architecture_style,
          JSON.stringify(result.historical_facts || []),
          JSON.stringify(result.interesting_stories || []),
          result.audio_text,
          language,
        ]
      ).catch((err) => console.error('Guide history save failed:', err.message))
    }

    res.json(result)
  } catch (err) {
    next(err)
  }
}

const getHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, attraction_name, location, construction_year, language, created_at
       FROM ai_guide_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.id]
    )
    res.json({ history: rows })
  } catch (err) {
    next(err)
  }
}

module.exports = { analyzeAttraction, getHistory }
