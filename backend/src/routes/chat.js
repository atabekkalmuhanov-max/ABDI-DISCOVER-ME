const { Router } = require('express')
const { authenticate } = require('../middleware/auth')
const { getSessions, getMessages, sendMessage, deleteSession } = require('../controllers/chatController')

const router = Router()

router.get('/sessions', authenticate, getSessions)
router.get('/sessions/:sessionId/messages', authenticate, getMessages)
router.post('/send', authenticate, sendMessage)
router.delete('/sessions/:sessionId', authenticate, deleteSession)

module.exports = router
