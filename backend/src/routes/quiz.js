const { Router } = require('express')
const { authenticate } = require('../middleware/auth')
const { submitQuiz, getQuizHistory } = require('../controllers/quizController')

const router = Router()

router.post('/submit', authenticate, submitQuiz)
router.get('/history', authenticate, getQuizHistory)

module.exports = router
