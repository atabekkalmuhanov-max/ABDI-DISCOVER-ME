require('dotenv').config()
const app = require('./app')
const { pool } = require('./utils/db')
const { runMigrations } = require('../scripts/migrate')

const PORT = process.env.PORT || 5000

const REQUIRED_ENV = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']

const start = async () => {
  const missing = REQUIRED_ENV.filter(k => !process.env[k] && !process.env.DATABASE_URL)
  if (missing.length) {
    console.error('Missing required env vars:', missing.join(', '))
    console.error('Copy backend/.env.example to backend/.env and fill in values.')
    process.exit(1)
  }

  try {
    await pool.query('SELECT 1')
    console.log('Database connected')

    await runMigrations()

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1)
  }
}

start()
