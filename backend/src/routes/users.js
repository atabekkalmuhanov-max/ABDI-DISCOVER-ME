const { Router } = require('express')
const { body } = require('express-validator')
const { authenticate } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { getProfile, updateProfile, changePassword } = require('../controllers/userController')

const router = Router()

router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)

router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  changePassword
)

module.exports = router
