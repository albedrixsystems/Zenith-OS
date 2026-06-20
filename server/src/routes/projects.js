const express = require('express')
const { Project, ActivityLog } = require('../models')
const { authenticate, agencyOnly } = require('../middleware/auth')
const router = express.Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const { clientId, status, page = 1, limit = 20 } = req.query
    const query = { deletedAt: null }
    if (clientId) query.clientId = clientId
    if (status && status !== 'all') query.status = status
    if (req.user.role === 'client') query.clientId = req.user.clientId

    const [projects, total] = await Promise.all([
      Project.find(query).populate('clientId', 'companyName').populate('teamMembers', 'name email').skip((page - 1) * limit).limit(+limit).sort({ createdAt: -1 }),
      Project.countDocuments(query),
    ])
    res.json({ projects, total })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', agencyOnly, async (req, res) => {
  try {
    const project = await Project.create(req.body)
    await ActivityLog.create({ action: 'created project', entityType: 'project', entityId: project._id, entityName: project.name, userId: req.user._id })
    res.status(201).json(project)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('clientId', 'companyName email').populate('teamMembers', 'name email avatar')
    if (!project) return res.status(404).json({ error: 'Project not found' })
    if (req.user.role === 'client' && project.clientId._id.toString() !== req.user.clientId?.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    res.json(project)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id', agencyOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

module.exports = router
