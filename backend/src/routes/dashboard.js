const { Router } = require('express')
const { authenticate } = require('../middleware/auth')
const { getStats } = require('../controllers/dashboardController')

const router = Router()

router.get('/stats', authenticate, getStats)

module.exports = router
