require('dotenv').config()
const app = require('./app')
const { pool } = require('./utils/db')
const { runMigrations } = require('../scripts/migrate')

const PORT = process.env.PORT || 5000

const start = async () => {
  const missing = [
    ...(!process.env.JWT_SECRET ? ['JWT_SECRET'] : []),
    ...(!process.env.DATABASE_URL
      ? ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].filter(k => !process.env[k])
      : []),
  ]
  if (missing.length) {
    console.error('Missing required env vars:', missing.join(', '))
    console.error('Copy backend/.env.example to backend/.env and fill in values.')
    process.exit(1)
  }

  // Bind the port first so Render's health checker detects it immediately.
  // DB connect and migrations happen after — API calls will fail until ready,
  // but the process stays alive and the port is open.
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
  })

  try {
    await pool.query('SELECT 1')
    console.log('Database connected')
    await runMigrations()
    console.log('Migrations complete — server ready')
  } catch (err) {
    console.error('Failed to connect to database or run migrations:', err)
    process.exit(1)
  }
}

start()
