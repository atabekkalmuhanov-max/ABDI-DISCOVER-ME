const db = require('../utils/db')

const LANG_NAMES = {
  en: 'English',
  uz: "O'zbek tili (Uzbek)",
  ru: 'Russian (Русский)',
  kk: 'Qaraqalpaq',
}

const CHARACTER_DESCRIPTIONS = {
  merchant:  'Silk Road merchant and long-distance trader carrying precious goods',
  architect: 'master architect and builder who designed and constructed this very place',
  scholar:   'learned scholar and student of theology, astronomy, or philosophy',
  ruler:     'local nobleman, governor, or ruler who oversaw this land',
  artisan:   'skilled craftsman — a tile-maker, calligrapher, or sculptor',
  pilgrim:   'devout pilgrim and traveler who journeyed here from distant lands',
}

const STORY_TOKENS = { short: 600, medium: 1200, long: 2000 }
const STORY_WORDS  = { short: '200–250', medium: '480–560', long: '900–1000' }

const generateStory = async (req, res, next) => {
  try {
    const {
      attraction_name,
      location,
      era,
      character_type = 'merchant',
      story_length   = 'medium',
      language       = 'en',
    } = req.body

    if (!attraction_name?.trim()) {
      return res.status(400).json({ message: 'Attraction name is required' })
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ message: 'AI service not configured' })
    }

    const Anthropic = require('@anthropic-ai/sdk')
    const client    = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const langName  = LANG_NAMES[language]  || 'English'
    const charDesc  = CHARACTER_DESCRIPTIONS[character_type] || CHARACTER_DESCRIPTIONS.merchant
    const wordRange = STORY_WORDS[story_length] || STORY_WORDS.medium
    const maxTokens = STORY_TOKENS[story_length] || STORY_TOKENS.medium

    const eraClause = era ? ` during the ${era}` : ''
    const locClause = location ? ` in ${location}` : ''

    const prompt = `You are a master historical storyteller and immersive narrative writer.

Write a vivid first-person story from the perspective of a ${charDesc} who lived${eraClause} at ${attraction_name}${locClause}.

REQUIREMENTS:
- Write ENTIRELY in ${langName}
- First person throughout ("I", "my", "we") — never break character
- Exactly ${wordRange} words for the story (count carefully)
- Weave in historically accurate details about daily life, trade, religion, politics, or architecture of the era
- Use rich sensory imagery: what you see, hear, smell, feel
- Build emotional depth: express wonder, longing, fear, pride, or reverence as fits the moment
- Embed educational facts naturally as lived experience — not as lectures
- Open with an immersive first line that drops the reader directly into the scene
- Write poetically but accessibly — like a master storyteller around a fire

Also write a brief 1–2 sentence character introduction (spoken as the narrator) that appears BEFORE the story begins.

Return ONLY a JSON object with this exact structure — no markdown, no extra text:
{
  "character_intro": "I am [name/role], [brief self-description]. [One more sentence of context.]",
  "story": "[The full narrative...]",
  "era_description": "[Short phrase for the historical era, e.g. '14th-century Timurid Samarkand']"
}`

    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages:   [{ role: 'user', content: prompt }],
    })

    let result
    try {
      const text      = message.content[0].text.trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      result          = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
    } catch {
      return res.status(500).json({ message: 'Failed to parse AI response' })
    }

    if (req.user?.id) {
      db.query(
        `INSERT INTO ai_story_history
           (user_id, attraction_name, location, era, character_type, story_length, story_text, character_intro, language)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          req.user.id,
          attraction_name,
          location || null,
          era || result.era_description || null,
          character_type,
          story_length,
          result.story,
          result.character_intro,
          language,
        ]
      ).catch((err) => console.error('Story history save failed:', err.message))
    }

    res.json({
      attraction_name,
      location:        location || null,
      era_description: result.era_description || era || null,
      character_type,
      story_length,
      character_intro: result.character_intro,
      story:           result.story,
    })
  } catch (err) {
    next(err)
  }
}

const getHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, attraction_name, location, era, character_type, story_length,
              story_text, character_intro, language, created_at
       FROM ai_story_history
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

module.exports = { generateStory, getHistory }
