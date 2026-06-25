const express = require('express')
const router = express.Router()
const { SupportTicket, ActivityLog } = require('../models')
const { authenticate, agencyOnly, readOnlyForViewer } = require('../middleware/auth')

router.use(authenticate)
router.use(readOnlyForViewer)

// GET all support tickets
router.get('/', async (req, res) => {
  try {
    const query = {}
    if (['client', 'client_viewer'].includes(req.user.role)) {
      query.clientId = req.user.clientId
    }
    const tickets = await SupportTicket.find(query)
      .populate('clientId', 'companyName contactPerson')
      .sort({ updatedAt: -1 })
    res.json(tickets)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create support ticket
router.post('/', async (req, res) => {
  try {
    const { subject, description, priority } = req.body
    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' })
    }

    let clientId = req.body.clientId
    if (['client', 'client_viewer'].includes(req.user.role)) {
      clientId = req.user.clientId
    }

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' })
    }

    const ticket = await SupportTicket.create({
      clientId,
      subject,
      description,
      priority: priority || 'medium',
      status: 'open',
      messages: [{
        senderId: req.user._id,
        senderName: req.user.name,
        message: description,
        createdAt: new Date()
      }]
    })

    await ActivityLog.create({
      action: 'created support ticket',
      entityType: 'support_ticket',
      entityId: ticket._id,
      entityName: subject,
      userId: req.user._id
    })

    res.status(201).json(ticket)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET ticket details
router.get('/:id', async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('clientId', 'companyName contactPerson')
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' })
    }

    if (['client', 'client_viewer'].includes(req.user.role) && ticket.clientId._id.toString() !== req.user.clientId?.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(ticket)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add reply message to ticket
router.post('/:id/messages', async (req, res) => {
  try {
    const { message } = req.body
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required' })
    }

    const ticket = await SupportTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' })
    }

    if (['client', 'client_viewer'].includes(req.user.role) && ticket.clientId.toString() !== req.user.clientId?.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    ticket.messages.push({
      senderId: req.user._id,
      senderName: req.user.name,
      message: message.trim(),
      createdAt: new Date()
    })

    // If client responds, set status back to open/in_progress. If admin responds, status stays or updates.
    if (['client', 'client_viewer'].includes(req.user.role)) {
      ticket.status = 'open'
    } else {
      ticket.status = 'in_progress'
    }

    await ticket.save()

    res.status(201).json(ticket)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT update status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!status || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' })
    }

    const ticket = await SupportTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' })
    }

    if (['client', 'client_viewer'].includes(req.user.role) && ticket.clientId.toString() !== req.user.clientId?.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }

    ticket.status = status
    await ticket.save()

    await ActivityLog.create({
      action: `updated ticket status to ${status}`,
      entityType: 'support_ticket',
      entityId: ticket._id,
      entityName: ticket.subject,
      userId: req.user._id
    })

    res.json(ticket)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
