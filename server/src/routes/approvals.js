const express = require('express')
const router = express.Router()
const { Approval, ActivityLog } = require('../models')
const { authenticate, agencyOnly } = require('../middleware/auth')

router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const query = {}
    if (req.user.role === 'client') query.clientId = req.user.clientId
    if (req.query.status && req.query.status !== 'all') query.status = req.query.status
    const approvals = await Approval.find(query)
      .populate('projectId', 'name')
      .populate('clientId', 'companyName')
      .populate('fileIds', 'name type size')
      .sort({ createdAt: -1 })
    res.json(approvals)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', agencyOnly, async (req, res) => {
  try {
    const approval = await Approval.create({ ...req.body, requestedBy: req.user._id })
    await ActivityLog.create({ action: 'requested approval', entityType: 'approval', entityId: approval._id, entityName: approval.title, userId: req.user._id })
    res.status(201).json(approval)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/:id/respond', async (req, res) => {
  try {
    const { status, clientComment } = req.body
    const approval = await Approval.findByIdAndUpdate(req.params.id, { status, clientComment, respondedAt: new Date() }, { new: true })
    if (!approval) return res.status(404).json({ error: 'Approval not found' })
    await ActivityLog.create({ action: `responded to approval: ${status}`, entityType: 'approval', entityId: approval._id, entityName: approval.title, userId: req.user._id })
    res.json(approval)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

module.exports = router
