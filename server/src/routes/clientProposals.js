const express = require('express')
const router = express.Router()
const { ClientProposal, ActivityLog } = require('../models')
const { authenticate, agencyOnly, readOnlyForViewer } = require('../middleware/auth')

router.use(authenticate)
router.use(readOnlyForViewer)

// GET all client proposals
router.get('/', async (req, res) => {
  try {
    const query = {}
    if (['client', 'client_viewer'].includes(req.user.role)) {
      query.clientId = req.user.clientId
    }
    const proposals = await ClientProposal.find(query)
      .populate('clientId', 'companyName contactPerson')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
    res.json(proposals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create client proposal request
router.post('/', async (req, res) => {
  try {
    const { title, description, type, estimatedBudget } = req.body
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    let clientId = req.body.clientId
    if (['client', 'client_viewer'].includes(req.user.role)) {
      clientId = req.user.clientId
    }

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' })
    }

    const proposal = await ClientProposal.create({
      clientId,
      title,
      description,
      type: type || 'new_project',
      estimatedBudget: Number(estimatedBudget) || 0,
      submittedBy: req.user._id,
      status: 'pending'
    })

    await ActivityLog.create({
      action: 'submitted work request proposal',
      entityType: 'client_proposal',
      entityId: proposal._id,
      entityName: title,
      userId: req.user._id
    })

    res.status(201).json(proposal)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET proposal details
router.get('/:id', async (req, res) => {
  try {
    const proposal = await ClientProposal.findById(req.params.id)
      .populate('clientId', 'companyName contactPerson')
      .populate('submittedBy', 'name email')
    if (!proposal) {
      return res.status(404).json({ error: 'Work request not found' })
    }

    if (['client', 'client_viewer'].includes(req.user.role) && proposal.clientId._id.toString() !== req.user.clientId?.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(proposal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT respond to proposal (agency only)
router.put('/:id/respond', agencyOnly, async (req, res) => {
  try {
    const { status, adminComment, estimatedBudget } = req.body
    if (!status || !['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' })
    }

    const proposal = await ClientProposal.findById(req.params.id)
    if (!proposal) {
      return res.status(404).json({ error: 'Work request not found' })
    }

    proposal.status = status
    if (adminComment !== undefined) proposal.adminComment = adminComment
    if (estimatedBudget !== undefined) proposal.estimatedBudget = Number(estimatedBudget) || 0
    await proposal.save()

    await ActivityLog.create({
      action: `responded to client proposal: ${status}`,
      entityType: 'client_proposal',
      entityId: proposal._id,
      entityName: proposal.title,
      userId: req.user._id
    })

    res.json(proposal)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
