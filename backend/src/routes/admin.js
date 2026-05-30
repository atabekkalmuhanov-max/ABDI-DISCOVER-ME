const { Router } = require('express')
const { authenticate } = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')
const {
  getStats,
  getUsers, updateUser, deleteUser,
  getDestinations, createDestination, updateDestination, deleteDestination,
  getReviews, deleteReview,
} = require('../controllers/adminController')

const router = Router()

router.use(authenticate, adminOnly)

router.get('/stats',                    getStats)

router.get('/users',                    getUsers)
router.put('/users/:id',                updateUser)
router.delete('/users/:id',             deleteUser)

router.get('/destinations',             getDestinations)
router.post('/destinations',            createDestination)
router.put('/destinations/:id',         updateDestination)
router.delete('/destinations/:id',      deleteDestination)

router.get('/reviews',                  getReviews)
router.delete('/reviews/:id',           deleteReview)

module.exports = router
