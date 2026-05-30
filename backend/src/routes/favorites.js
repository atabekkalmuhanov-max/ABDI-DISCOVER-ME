const { Router } = require('express')
const { authenticate } = require('../middleware/auth')
const { getFavorites, getFavoriteIds, addFavorite, removeFavorite } = require('../controllers/favoritesController')

const router = Router()

router.use(authenticate)

router.get('/',                                getFavorites)
router.get('/ids',                             getFavoriteIds)
router.post('/',                               addFavorite)
router.delete('/:entity_type/:entity_id',      removeFavorite)

module.exports = router
