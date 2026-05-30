const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} → ${status}:`, err.message)
  if (status >= 500) console.error(err.stack)

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Resource already exists' })
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced resource not found' })
  }
  if (err.code === '42P01') {
    // relation does not exist — missing migration
    console.error('[DB] Missing table:', err.message)
    return res.status(500).json({ message: 'Database schema error — run migrations' })
  }

  const isDev = process.env.NODE_ENV !== 'production'
  const message = status < 500 || isDev ? err.message : 'Internal server error'
  res.status(status).json({ message })
}

const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` })
}

module.exports = { errorHandler, notFound }
