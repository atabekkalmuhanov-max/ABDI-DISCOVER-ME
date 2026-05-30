const db = require('../utils/db')
const User = require('../models/User')

const getProfile = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, bio, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ message: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body
    const updates = []
    const values = []
    let i = 1

    if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name) }
    if (bio !== undefined) { updates.push(`bio = $${i++}`); values.push(bio) }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' })
    }

    values.push(req.user.id)
    const { rows } = await db.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${i}
       RETURNING id, name, email, role, bio, avatar_url, created_at`,
      values
    )
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const { rows } = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ message: 'User not found' })

    const valid = await User.verifyPassword(currentPassword, rows[0].password_hash)
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' })

    await User.updatePassword(req.user.id, newPassword)
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getProfile, updateProfile, changePassword }
