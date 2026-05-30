const db = require('../utils/db')
const bcrypt = require('bcryptjs')

const User = {
  async create({ name, email, password, role = 'user' }) {
    const hash = await bcrypt.hash(password, 12)
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, bio, avatar_url, created_at`,
      [name, email, hash, role]
    )
    return rows[0]
  },

  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email])
    return rows[0] || null
  },

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id, name, email, role, bio, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    )
    return rows[0] || null
  },

  async verifyPassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash)
  },

  async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 12)
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hash, id]
    )
  },
}

module.exports = User
