const { Router } = require('express')
const { authenticate, optionalAuth } = require('../middleware/auth')
const { getRoutes, getRoute, createRoute, updateRoute, deleteRoute } = require('../controllers/routePlannerController')

const router = Router()

router.get('/',      optionalAuth, getRoutes)
router.get('/:id',   optionalAuth, getRoute)
router.post('/',     authenticate, createRoute)
router.put('/:id',   authenticate, updateRoute)
router.delete('/:id', authenticate, deleteRoute)

module.exports = router
