const Destination = require('../models/Destination')

const getAll = async (req, res, next) => {
  try {
    const { search, category, featured, limit, offset } = req.query
    const result = await Destination.findAll({
      search,
      category,
      featured: featured === 'true',
      limit: parseInt(limit, 10) || 20,
      offset: parseInt(offset, 10) || 0,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

const getOne = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id)
    if (!destination) return res.status(404).json({ message: 'Destination not found' })
    res.json(destination)
  } catch (err) {
    next(err)
  }
}

const create = async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body)
    res.status(201).json(destination)
  } catch (err) {
    next(err)
  }
}

const update = async (req, res, next) => {
  try {
    const destination = await Destination.update(req.params.id, req.body)
    if (!destination) return res.status(404).json({ message: 'Destination not found' })
    res.json(destination)
  } catch (err) {
    next(err)
  }
}

const remove = async (req, res, next) => {
  try {
    const deleted = await Destination.delete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Destination not found' })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

module.exports = { getAll, getOne, create, update, remove }
