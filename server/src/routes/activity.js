const express = require('express')
const router = express.Router()
const { ActivityLog } = require('../models')
const { authenticate, agencyOnly } = require('../middleware/auth')

router.use(authenticate, agencyOnly)

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, entityType } = req.query
    const query = entityType ? { entityType } : {}
    const [logs, total] = await Promise.all([
      ActivityLog.find(query).populate('userId', 'name avatar').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit),
      ActivityLog.countDocuments(query),
    ])
    res.json({ logs, total })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
