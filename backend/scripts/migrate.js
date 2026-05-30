require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const fs = require('fs')
const path = require('path')
const { pool } = require('../src/utils/db')

const MIGRATIONS_DIR = path.join(__dirname, '../../database/migrations')

async function runMigrations() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    const { rows: applied } = await client.query('SELECT filename FROM schema_migrations')
    const appliedSet = new Set(applied.map(r => r.filename))

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort()

    let appliedCount = 0
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`[migrate] skip (already applied): ${file}`)
        continue
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      console.log(`[migrate] applying: ${file}`)

      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
        console.log(`[migrate] applied: ${file}`)
        appliedCount++
      } catch (err) {
        console.error(`[migrate] FAILED on ${file}:`, err.message)
        throw err
      }
    }

    if (appliedCount === 0) {
      console.log('[migrate] all migrations already applied')
    } else {
      console.log(`[migrate] applied ${appliedCount} migration(s)`)
    }
  } finally {
    client.release()
  }
}

module.exports = { runMigrations }

if (require.main === module) {
  runMigrations()
    .then(() => { console.log('[migrate] done'); process.exit(0) })
    .catch(err => { console.error('[migrate] error:', err); process.exit(1) })
    .finally(() => pool.end())
}
