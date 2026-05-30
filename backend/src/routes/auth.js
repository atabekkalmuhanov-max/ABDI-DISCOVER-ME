const router = require('express').Router()
const { body } = require('express-validator')
const { register, login, me, refresh, logout } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')
const validate = require('../middleware/validate')

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
)

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('rememberMe').optional().isBoolean(),
  ],
  validate,
  login
)

router.get('/me', authenticate, me)
router.post('/refresh', refresh)
router.post('/logout', logout)

module.exports = router
