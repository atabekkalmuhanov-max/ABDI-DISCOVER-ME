const router = require('express').Router()
const { body } = require('express-validator')
const { getByDestination, create, remove } = require('../controllers/reviewController')
const { authenticate } = require('../middleware/auth')
const validate = require('../middleware/validate')

router.get('/destination/:destinationId', getByDestination)

router.post(
  '/',
  authenticate,
  [
    body('destination_id').isInt(),
    body('rating').isFloat({ min: 1, max: 5 }),
    body('comment').trim().isLength({ min: 10, max: 1000 }),
  ],
  validate,
  create
)

router.delete('/:id', authenticate, remove)

module.exports = router
