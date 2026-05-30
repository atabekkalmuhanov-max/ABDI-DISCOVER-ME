require('dotenv').config()
const app = require('./app')
const { pool } = require('./utils/db')

const PORT = process.env.PORT || 5000

const start = async () => {
  try {
    await pool.query('SELECT 1')
    console.log('Database connected')

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1)
  }
}

start()
