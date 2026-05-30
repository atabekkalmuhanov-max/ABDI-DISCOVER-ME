const db = require('../utils/db')

const SYSTEM_PROMPT = `You are an expert AI Travel Assistant specialized in Uzbekistan tourism. You help travelers with:
- Travel planning and multi-day itineraries
- Hotel recommendations (budget to luxury)
- Restaurant and local food recommendations
- Transportation advice (flights, trains, shared taxis, local transport)
- Historical and cultural information about cities and monuments
- Personalized travel routes optimized for time and interests
- Budget calculations and cost estimates in USD
- Visa and entry requirements
- Best times to visit each region
- Local customs, etiquette, and practical tips

Key cities: Tashkent, Samarkand, Bukhara, Khiva, Nukus, Namangan, Andijan, Fergana, Shakhrisabz, Termez.

When calculating budgets use USD as the primary currency but mention UZS (Uzbek som) where helpful. Be friendly, specific, and actionable. Use bullet points and structure your answers clearly. When recommending hotels or restaurants include price ranges and why each is worth visiting.`

const getSessions = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, title, created_at, updated_at
       FROM chat_sessions
       WHERE user_id = $1
       ORDER BY updated_at DESC
       LIMIT 50`,
      [req.user.id]
    )
    res.json({ sessions: rows })
  } catch (err) {
    next(err)
  }
}

const getMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params

    const { rows: session } = await db.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    )
    if (!session.length) return res.status(404).json({ message: 'Session not found' })

    const { rows } = await db.query(
      'SELECT id, role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    )
    res.json({ messages: rows })
  } catch (err) {
    next(err)
  }
}

const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' })

    let currentSessionId = sessionId

    if (!currentSessionId) {
      const title = message.slice(0, 60).trim()
      const { rows } = await db.query(
        'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING id',
        [req.user.id, title]
      )
      currentSessionId = rows[0].id
    } else {
      const { rows: session } = await db.query(
        'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
        [currentSessionId, req.user.id]
      )
      if (!session.length) return res.status(404).json({ message: 'Session not found' })
    }

    await db.query(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
      [currentSessionId, 'user', message]
    )

    const { rows: history } = await db.query(
      'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [currentSessionId]
    )

    const messages = history.map((m) => ({ role: m.role, content: m.content }))

    let assistantReply

    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages,
      })
      assistantReply = response.content[0].text
    } else {
      assistantReply = getFallbackResponse(message)
    }

    await db.query(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
      [currentSessionId, 'assistant', assistantReply]
    )

    await db.query(
      'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
      [currentSessionId]
    )

    res.json({
      sessionId: currentSessionId,
      message: { role: 'assistant', content: assistantReply },
    })
  } catch (err) {
    next(err)
  }
}

const deleteSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params
    await db.query(
      'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    )
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

function getFallbackResponse(message) {
  const msg = message.toLowerCase()

  if (msg.includes('hotel') || msg.includes('stay') || msg.includes('accommodation') || msg.includes('sleep')) {
    return `**Hotel Recommendations in Uzbekistan**

**Samarkand:**
- **Registan Plaza Hotel** (4★) — ~$80/night, steps from Registan Square
- **Bibi Khanym Hotel** (3★) — ~$45/night, charming boutique in the old city
- **Hotel Malika Prime** (3★) — ~$35/night, great value with rooftop terrace

**Bukhara:**
- **Komil Bukhara Hotel** (4★) — ~$70/night, historic mud-brick courtyard
- **Sasha & Son's Hotel** (3★) — ~$40/night, legendary traveler favorite

**Tashkent:**
- **Hyatt Regency Tashkent** (5★) — ~$150/night, top luxury option
- **Ramada by Wyndham** (4★) — ~$90/night, central location near metro
- **Mirzo Hotel** (3★) — ~$50/night, clean and well-located

**Khiva:**
- **Malika Khiva Hotel** (3★) — ~$55/night, inside the Itchan Kala walls

Which city are you visiting? I can give more tailored recommendations!`
  }

  if (msg.includes('restaurant') || msg.includes('food') || msg.includes('eat') || msg.includes('cuisine') || msg.includes('dish')) {
    return `**Food & Restaurant Guide for Uzbekistan**

**Must-Try Dishes:**
- **Plov** — the national dish, rice pilaf cooked with lamb, carrots, and spices
- **Shashlik** — marinated meat skewers grilled over charcoal
- **Lagman** — hand-pulled noodles in a rich broth with vegetables and meat
- **Samsa** — flaky baked pastries filled with lamb and onion
- **Manti** — steamed dumplings, similar to dim sum
- **Dimlama** — slow-cooked vegetable and meat stew

**Top Restaurants:**
- **Tashkent:** Caravan Restaurant (~$15/person), Plov Center on Sundays ($3/plate), Besh Qozon
- **Samarkand:** Terrassa Restaurant ($10–20/person), Platan Restaurant
- **Bukhara:** Lyabi-Hauz Chaikhana (atmospheric lakeside), Minzifa Restaurant
- **Khiva:** Terrassa Farrukh (rooftop views of old city)

**Budget Guide:**
- Street food & local canteens: $2–5 per meal
- Mid-range restaurants: $8–15 per person
- Upscale dining: $20–40 per person

Would you like recommendations for a specific city?`
  }

  if (msg.includes('transport') || msg.includes('train') || msg.includes('bus') || msg.includes('flight') || msg.includes('travel between') || msg.includes('get to') || msg.includes('get from')) {
    return `**Transportation in Uzbekistan**

**Between Cities:**
- **Afrosiyob High-Speed Train** — Tashkent ↔ Samarkand in 2h ($10–20), Samarkand ↔ Bukhara in 1.5h
- **Sharq Train** — Tashkent ↔ Bukhara in 3.5h ($8–15)
- **Shared Taxis (marshrutka)** — faster but cramped; Samarkand → Bukhara ~3h for $5–8
- **Domestic Flights** — Uzbekistan Airways connects Tashkent to Urgench (near Khiva), Nukus

**Within Cities:**
- **Tashkent Metro** — clean, fast, $0.15/ride; best way to get around Tashkent
- **Yandex Taxi** — reliable ride-hailing app, $1–3 per ride within city
- **Local buses** — cheap but complex; use for short distances

**Recommended Route (7 days):**
Tashkent → Samarkand (train 2h) → Bukhara (train 1.5h) → Khiva (fly or shared taxi via Urgench)

Shall I build a full itinerary around your travel dates?`
  }

  if (msg.includes('budget') || msg.includes('cost') || msg.includes('price') || msg.includes('money') || msg.includes('expensive') || msg.includes('cheap')) {
    return `**Uzbekistan Travel Budget Guide**

**Daily Budget Estimates (USD per person):**

🎒 **Backpacker: $25–40/day**
- Hostel dorm or guesthouse: $8–15
- Street food & local canteens: $5–8
- Public transport: $2–3
- Entrance fees: $5–10

✈️ **Mid-Range Traveler: $60–100/day**
- 3-star hotel (double room): $35–55
- Restaurant meals: $15–20
- Taxis & trains: $8–12
- Attractions + guided tours: $15–20

🌟 **Comfortable: $120–200/day**
- 4-star hotel: $80–120
- Good restaurants: $25–35
- Private transfers: $20–30
- Private guide + premium sites: $30–50

**Typical Trip Costs (7 days, mid-range):**
- Accommodation: $280–350
- Food: $100–140
- Transport (trains + local): $50–70
- Attractions & tours: $80–120
- **Total: ~$510–680** (excluding international flights)

**Visa:** eVisa costs $20 for most nationalities. Many countries get 30-day visa-free entry.

Want a detailed day-by-day budget breakdown for your trip?`
  }

  if (msg.includes('history') || msg.includes('historical') || msg.includes('silk road') || msg.includes('monument') || msg.includes('ancient')) {
    return `**Uzbekistan's Rich History & Key Sites**

Uzbekistan sits at the heart of the ancient Silk Road — one of the world's great civilizations flourished here.

**Key Historical Sites:**

🏛️ **Samarkand**
- **Registan Square** — three magnificent madrasahs dating to the 15th–17th century
- **Shah-i-Zinda** — "Street of Mausoleums," a breathtaking necropolis
- **Gur-e-Amir** — Timur's (Tamerlane's) mausoleum, 1403

🕌 **Bukhara** (UNESCO World Heritage City)
- **Kalon Minaret** — 47m tower built in 1127, visible for 40km
- **Ark Citadel** — ancient fortress used continuously for 2,500 years
- **Bolo Hauz Mosque** — 20 ornately carved wooden columns

🏰 **Khiva**
- **Itchan Kala** — the entire inner walled city is a UNESCO World Heritage Site
- **Kalta Minor Minaret** — unfinished but iconic turquoise minaret

📜 **Historical context:**
- 329 BC — Alexander the Great passed through Samarkand (then Marakanda)
- 8th–9th century — Islamic Golden Age; Bukhara was a world center of learning
- 14th century — Timur (Tamerlane) built his empire from Samarkand
- 19th century — Russian Empire absorbed the region

Which city's history would you like to explore in depth?`
  }

  if (msg.includes('itinerary') || msg.includes('route') || msg.includes('plan') || msg.includes('days') || msg.includes('week')) {
    return `**Suggested Uzbekistan Itineraries**

**7-Day Classic Silk Road:**
- Day 1–2: **Tashkent** — Chorsu Bazaar, Islamic Architecture Museum, metro tour
- Day 3–4: **Samarkand** — Registan, Gur-e-Amir, Shah-i-Zinda, Ulugbek Observatory
- Day 5–6: **Bukhara** — Ark Citadel, Kalon Complex, Lyabi-Hauz, Trading Domes
- Day 7: Return to Tashkent (train) for departure

**10-Day Extended:**
- Days 1–2: Tashkent
- Days 3–5: Samarkand
- Days 6–7: Bukhara
- Days 8–9: **Khiva** (fly Bukhara → Urgench, then taxi)
- Day 10: Return via Urgench → Tashkent

**5-Day Quick Highlights:**
- Day 1: Tashkent
- Days 2–3: Samarkand
- Days 4–5: Bukhara, return to Tashkent

**Best Travel Months:** April–May and September–October (mild weather, fewer crowds)

Tell me how many days you have and your interests — I'll create a personalized route for you!`
  }

  return `**Welcome to your Uzbekistan Travel Assistant!** 🇺🇿

I'm here to help you plan the perfect trip to the land of the Silk Road. Here's what I can help with:

🏨 **Hotels** — Budget to luxury recommendations in every city
🍽️ **Restaurants** — Local cuisine, must-try dishes, price guides
🚆 **Transportation** — Trains, flights, shared taxis between cities
🗺️ **Itineraries** — Day-by-day personalized travel routes
📜 **History** — Monuments, cities, the Silk Road, Timur's empire
💰 **Budget** — Realistic cost breakdowns for any budget level
🌤️ **Best Time to Visit** — Season and weather guidance
📋 **Practical Tips** — Visa, currency, SIM cards, safety

**Popular questions to get started:**
- "Plan me a 7-day itinerary for Samarkand and Bukhara"
- "What hotels do you recommend in Khiva?"
- "How do I get from Tashkent to Samarkand?"
- "What's the budget for a 10-day trip?"

What would you like to know?`
}

module.exports = { getSessions, getMessages, sendMessage, deleteSession }
