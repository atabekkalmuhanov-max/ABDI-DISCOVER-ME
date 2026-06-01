const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const app = express()

// Required for Render (and any reverse proxy): fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1)

app.use(helmet())

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://abdi-discover-me-3qgf.vercel.app',
]
const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : []
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 })
app.use('/api', limiter)

app.use('/api/auth', require('./routes/auth'))
app.use('/api/destinations', require('./routes/destinations'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/users', require('./routes/users'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/ai', aiLimiter, require('./routes/ai'))
app.use('/api/guide', aiLimiter, require('./routes/guide'))
app.use('/api/quiz',  aiLimiter, require('./routes/quiz'))
app.use('/api/story', aiLimiter, require('./routes/story'))
app.use('/api/time-travel', aiLimiter, require('./routes/timeTravel'))
app.use('/api/chat', aiLimiter, require('./routes/chat'))
app.use('/api/hidden-places', aiLimiter, require('./routes/hiddenPlaces'))
app.use('/api/passport', require('./routes/passport'))
app.use('/api/routes', require('./routes/routePlanner'))
app.use('/api/favorites', require('./routes/favorites'))
app.use('/api/admin', require('./routes/admin'))

app.get('/', (_, res) => res.json({ status: 'ok', message: 'Backend running' }))
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use(notFound)
app.use(errorHandler)

module.exports = app
