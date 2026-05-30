const db = require('../utils/db')

const LANG_NAMES = {
  en: 'English',
  uz: "O'zbek tili (Uzbek)",
  ru: 'Russian (Русский)',
  kk: 'Qaraqalpaq',
}

async function generateHistoricalImage(prompt) {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            { text: prompt, weight: 1 },
            {
              text: 'modern architecture, cars, power lines, electric cables, tourists, smartphones, anachronistic elements, contemporary buildings',
              weight: -1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
        }),
      }
    )

    if (!response.ok) return null
    const data = await response.json()
    const artifact = data.artifacts?.[0]
    if (!artifact?.base64) return null
    return `data:image/png;base64,${artifact.base64}`
  } catch {
    return null
  }
}

const analyzeTimeTravel = async (req, res, next) => {
  try {
    const { language = 'en', target_era = '' } = req.body

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
    const eraContext = target_era
      ? `The user wants to travel back to: "${target_era}". Focus reconstruction on that specific era.`
      : 'Focus on the most visually distinct and historically significant era of this place.'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
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
              text: `You are an expert historian and architectural archaeologist specializing in world heritage sites and Central Asian monuments. Analyze this image for an "AI Time Travel" feature that shows how a historical place looked in the past versus today.

${eraContext}

Respond entirely in ${langName}. Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "identified": true,
  "name": "Full official name of the attraction",
  "location": "City, Country",
  "construction_year": "Year or period built",
  "current_period": "Label for what is shown today (e.g. 'Modern Day, 2020s')",
  "peak_era": "Label for the most historically significant era (e.g. 'Timurid Golden Age, 14th–15th century')",
  "historical_significance": "2–3 sentences on why this site matters to world history",
  "historical_periods": [
    {
      "era": "Era name",
      "year_range": "e.g. 1370–1405",
      "description": "What the place looked like and its role in that era, 2–3 sentences",
      "key_changes": ["Notable change 1", "Notable change 2"]
    }
  ],
  "timeline_events": [
    {
      "year": "Year or century",
      "event": "Short event title",
      "significance": "One sentence on why this event mattered",
      "type": "construction|renovation|destruction|restoration|cultural|conquest"
    }
  ],
  "comparison": {
    "current_description": "How the attraction looks today, 2–3 sentences",
    "historical_description": "How it looked during its peak historical era, 2–3 sentences",
    "key_differences": [
      "Difference between past and present appearance 1",
      "Difference 2",
      "Difference 3",
      "Difference 4"
    ],
    "preservation_status": "Brief note on current preservation and restoration state"
  },
  "image_generation_prompt": "A photorealistic, highly detailed digital painting of [place name] during [peak era, specific year]. [Describe: exact colors of tiles/stones/domes, decorative patterns, surrounding landscape, period-accurate people in traditional clothing, natural lighting conditions, scale and grandeur]. The scene shows [specific architectural features that existed then]. Masterwork historical illustration, vibrant jewel-toned colors, architectural precision, cinematic composition. No modern elements whatsoever."
}

If you cannot identify a specific historical attraction or landmark, return:
{"identified": false, "message": "Could not identify a specific historical attraction. Please upload a clear photo of a historical site, monument, or landmark."}`,
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

    let historical_image = null
    if (result.identified !== false && result.image_generation_prompt) {
      historical_image = await generateHistoricalImage(result.image_generation_prompt)
    }

    if (result.identified !== false && req.user?.id) {
      db.query(
        `INSERT INTO ai_time_travel_history
           (user_id, attraction_name, location, construction_year, target_era,
            historical_periods, timeline_events, comparison, image_generation_prompt, language)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          req.user.id,
          result.name,
          result.location,
          result.construction_year,
          target_era || result.peak_era || '',
          JSON.stringify(result.historical_periods || []),
          JSON.stringify(result.timeline_events || []),
          JSON.stringify(result.comparison || {}),
          result.image_generation_prompt || '',
          language,
        ]
      ).catch((err) => console.error('Time travel history save failed:', err.message))
    }

    res.json({ ...result, historical_image })
  } catch (err) {
    next(err)
  }
}

const getHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, attraction_name, location, construction_year, target_era, language, created_at
       FROM ai_time_travel_history
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

module.exports = { analyzeTimeTravel, getHistory }
