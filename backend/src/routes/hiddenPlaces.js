const router = require('express').Router()
const { authenticate } = require('../middleware/auth')
const { discover, getHistory } = require('../controllers/hiddenPlacesController')

router.post('/discover', authenticate, discover)
router.get('/history', authenticate, getHistory)

module.exports = router
