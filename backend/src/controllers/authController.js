const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const db = require('../utils/db')

const REFRESH_DAYS_SHORT = 7
const REFRESH_DAYS_LONG = 30

const signAccess = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  )

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

const createSession = async (userId, rawToken, rememberMe) => {
  const days = rememberMe ? REFRESH_DAYS_LONG : REFRESH_DAYS_SHORT
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  await db.query(
    'INSERT INTO sessions (user_id, token_hash, remember_me, expires_at) VALUES ($1, $2, $3, $4)',
    [userId, hashToken(rawToken), rememberMe, expiresAt]
  )
  return expiresAt
}

const setRefreshCookie = (res, rawToken, rememberMe) => {
  const days = rememberMe ? REFRESH_DAYS_LONG : REFRESH_DAYS_SHORT
  res.cookie('refreshToken', rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: days * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  })
}

const issueSession = async (user, res, rememberMe = false) => {
  const rawToken = crypto.randomBytes(40).toString('hex')
  await createSession(user.id, rawToken, rememberMe)
  setRefreshCookie(res, rawToken, rememberMe)
  return signAccess(user)
}

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const existing = await User.findByEmail(email)
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password })
    const token = await issueSession(user, res, false)
    res.status(201).json({ user, token })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe = false } = req.body
    const user = await User.findByEmail(email)
    if (!user || !(await User.verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const { password_hash, ...safeUser } = user
    const token = await issueSession(safeUser, res, Boolean(rememberMe))
    res.json({ user: safeUser, token })
  } catch (err) {
    next(err)
  }
}

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

const refresh = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken
    if (!rawToken) return res.status(401).json({ message: 'No refresh token' })

    const hash = hashToken(rawToken)
    const { rows } = await db.query(
      'SELECT * FROM sessions WHERE token_hash = $1 AND expires_at > NOW()',
      [hash]
    )
    if (!rows[0]) return res.status(401).json({ message: 'Invalid or expired session' })

    // Rotate: delete old session and issue new one
    await db.query('DELETE FROM sessions WHERE token_hash = $1', [hash])

    const user = await User.findById(rows[0].user_id)
    if (!user) return res.status(401).json({ message: 'User not found' })

    const accessToken = await issueSession(user, res, rows[0].remember_me)
    res.json({ token: accessToken, user })
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken
    if (rawToken) {
      await db.query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(rawToken)])
    }
    res.clearCookie('refreshToken', { path: '/api/auth' })
    res.json({ message: 'Logged out' })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, me, refresh, logout }
