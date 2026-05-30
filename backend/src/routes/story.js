const { Router } = require('express')
const { authenticate } = require('../middleware/auth')
const { generateStory, getHistory } = require('../controllers/storyController')

const router = Router()

router.post('/generate', authenticate, generateStory)
router.get('/history',  authenticate, getHistory)

module.exports = router
