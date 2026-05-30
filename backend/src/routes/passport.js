const router = require('express').Router()
const { authenticate } = require('../middleware/auth')
const { getPassport, markVisited, unmarkVisited, getVisitedIds } = require('../controllers/passportController')

router.get('/',                       authenticate, getPassport)
router.get('/visited-ids',            authenticate, getVisitedIds)
router.post('/visit',                 authenticate, markVisited)
router.delete('/visit/:destinationId', authenticate, unmarkVisited)

module.exports = router
