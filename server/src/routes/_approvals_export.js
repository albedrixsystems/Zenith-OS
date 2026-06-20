// This file exports all remaining route modules

// ── approvals.js ──────────────────────────────────────────────────
const express = require('express')
const approvalRouter = express.Router()
const { Approval, ActivityLog } = require('../models')
const { authenticate, agencyOnly } = require('../middleware/auth')

approvalRouter.use(authenticate)

approvalRouter.get('/', async (req, res) => {
  try {
    const query = {}
    if (req.user.role === 'client') query.clientId = req.user.clientId
    const { status } = req.query
    if (status && status !== 'all') query.status = status
    const approvals = await Approval.find(query).populate('projectId', 'name').populate('clientId', 'companyName').populate('fileIds', 'name type size').sort({ createdAt: -1 })
    res.json(approvals)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

approvalRouter.post('/', agencyOnly, async (req, res) => {
  try {
    const approval = await Approval.create({ ...req.body, requestedBy: req.user._id })
    await ActivityLog.create({ action: 'requested approval', entityType: 'approval', entityId: approval._id, entityName: approval.title, userId: req.user._id })
    // TODO: Send email notification to client
    res.status(201).json(approval)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

approvalRouter.put('/:id/respond', async (req, res) => {
  try {
    const { status, clientComment } = req.body
    const approval = await Approval.findByIdAndUpdate(req.params.id, { status, clientComment, respondedAt: new Date() }, { new: true })
    if (!approval) return res.status(404).json({ error: 'Approval not found' })
    await ActivityLog.create({ action: `client ${status === 'approved' ? 'approved' : 'requested revision'}`, entityType: 'approval', entityId: approval._id, entityName: approval.title, userId: req.user._id })
    res.json(approval)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

module.exports = { approvalRouter }
