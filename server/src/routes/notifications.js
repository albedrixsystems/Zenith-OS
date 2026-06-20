const express = require('express')
const router = express.Router()
const { Notification } = require('../models')
const { authenticate } = require('../middleware/auth')

router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50)
    res.json(notifications)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
    res.json(notification)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
