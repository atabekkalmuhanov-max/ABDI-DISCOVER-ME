const { Pool } = require('pg')

const useConnectionString = Boolean(process.env.DATABASE_URL)

const pool = new Pool({
  connectionString: useConnectionString ? process.env.DATABASE_URL : undefined,
  host: useConnectionString ? undefined : process.env.DB_HOST,
  port: useConnectionString ? undefined : parseInt(process.env.DB_PORT, 10),
  database: useConnectionString ? undefined : process.env.DB_NAME,
  user: useConnectionString ? undefined : process.env.DB_USER,
  password: useConnectionString ? undefined : process.env.DB_PASSWORD,
  ssl: useConnectionString ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const query = (text, params) => pool.query(text, params)

const getClient = () => pool.connect()

module.exports = { query, getClient, pool }
