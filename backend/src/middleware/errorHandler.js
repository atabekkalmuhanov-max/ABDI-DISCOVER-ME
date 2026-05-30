const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Resource already exists' })
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced resource not found' })
  }

  const status = err.status || err.statusCode || 500
  const message = status < 500 ? err.message : 'Internal server error'
  res.status(status).json({ message })
}

const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` })
}

module.exports = { errorHandler, notFound }
