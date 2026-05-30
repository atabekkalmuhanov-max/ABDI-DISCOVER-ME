const router = require('express').Router()
const { body } = require('express-validator')
const { getAll, getOne, create, update, remove } = require('../controllers/destinationController')
const { authenticate, authorize } = require('../middleware/auth')
const validate = require('../middleware/validate')

const destValidation = [
  body('name').trim().notEmpty(),
  body('country').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  body('price_level').optional().isInt({ min: 1, max: 4 }),
]

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', authenticate, authorize('admin'), destValidation, validate, create)
router.put('/:id', authenticate, authorize('admin'), destValidation, validate, update)
router.delete('/:id', authenticate, authorize('admin'), remove)

module.exports = router
