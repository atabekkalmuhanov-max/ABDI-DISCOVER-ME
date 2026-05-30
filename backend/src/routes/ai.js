const { Router } = require('express')
const { authenticate } = require('../middleware/auth')
const { getRecommendations } = require('../controllers/aiController')

const router = Router()

router.post('/recommend', authenticate, getRecommendations)

module.exports = router
