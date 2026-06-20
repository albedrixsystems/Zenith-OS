// tasks.js
const express = require('express')
const { Task, ActivityLog } = require('../models')
const { authenticate, agencyOnly } = require('../middleware/auth')
const router = express.Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const { projectId, status, assigneeId } = req.query
    const query = { deletedAt: null }
    if (projectId) query.projectId = projectId
    if (status) query.status = status
    if (assigneeId) query.assigneeId = assigneeId
    const tasks = await Task.find(query).populate('assigneeId', 'name avatar').sort({ order: 1, createdAt: -1 })
    res.json(tasks)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', agencyOnly, async (req, res) => {
  try {
    const task = await Task.create(req.body)
    await ActivityLog.create({ action: 'created task', entityType: 'task', entityId: task._id, entityName: task.title, userId: req.user._id })
    res.status(201).json(task)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/:id', agencyOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (req.body.status === 'done') {
      await ActivityLog.create({ action: 'marked task done', entityType: 'task', entityId: task._id, entityName: task.title, userId: req.user._id })
    }
    res.json(task)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.delete('/:id', agencyOnly, async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, { deletedAt: new Date() })
    res.json({ message: 'Task deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
