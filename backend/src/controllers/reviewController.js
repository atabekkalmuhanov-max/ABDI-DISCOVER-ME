const Review = require('../models/Review')

const getByDestination = async (req, res, next) => {
  try {
    const reviews = await Review.findByDestination(req.params.destinationId)
    res.json(reviews)
  } catch (err) {
    next(err)
  }
}

const create = async (req, res, next) => {
  try {
    const { destination_id, rating, comment } = req.body
    const review = await Review.create({
      destination_id,
      user_id: req.user.id,
      rating,
      comment,
    })
    res.status(201).json(review)
  } catch (err) {
    next(err)
  }
}

const remove = async (req, res, next) => {
  try {
    const deleted = await Review.delete(req.params.id, req.user.id)
    if (!deleted) return res.status(404).json({ message: 'Review not found or not authorized' })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

module.exports = { getByDestination, create, remove }
