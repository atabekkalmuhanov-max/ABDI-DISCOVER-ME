const { Router } = require('express')
const multer = require('multer')
const { authenticate } = require('../middleware/auth')
const { analyzeAttraction, getHistory } = require('../controllers/guideController')

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

router.post('/analyze', authenticate, upload.single('image'), analyzeAttraction)
router.get('/history', authenticate, getHistory)

module.exports = router
