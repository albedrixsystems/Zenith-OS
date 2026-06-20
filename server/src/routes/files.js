const express = require('express')
const router = express.Router()
const multer = require('multer')
const { File, ActivityLog } = require('../models')
const { authenticate, agencyOnly } = require('../middleware/auth')

router.use(authenticate)

// Memory storage for demo; swap for multer-s3 in production
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/postscript', 'image/vnd.adobe.photoshop']
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('File type not supported'), false)
    }
  },
})

router.get('/', async (req, res) => {
  try {
    const query = { deletedAt: null }
    if (req.query.projectId) query.projectId = req.query.projectId
    const files = await File.find(query).populate('uploadedBy', 'name').sort({ createdAt: -1 })
    res.json(files)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/upload', agencyOnly, upload.array('files', 10), async (req, res) => {
  try {
    const { projectId, isClientVisible = true } = req.body
    const createdFiles = []

    for (const file of req.files) {
      const ext = file.originalname.split('.').pop().toLowerCase()
      // In production: upload to S3 and get key
      const s3Key = `projects/${projectId}/${Date.now()}-${file.originalname}`

      const dbFile = await File.create({
        name: file.originalname,
        originalName: file.originalname,
        type: ext,
        mimeType: file.mimetype,
        size: file.size,
        s3Key,
        s3Bucket: process.env.AWS_S3_BUCKET || 'zenithos-files',
        projectId,
        uploadedBy: req.user._id,
        isClientVisible: isClientVisible === 'true',
      })
      createdFiles.push(dbFile)

      await ActivityLog.create({ action: 'uploaded file', entityType: 'file', entityId: dbFile._id, entityName: file.originalname, userId: req.user._id })
    }

    res.status(201).json(createdFiles)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.get('/:id/download', async (req, res) => {
  try {
    const file = await File.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true })
    if (!file) return res.status(404).json({ error: 'File not found' })
    // In production: generate signed S3 URL
    // const url = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: file.s3Bucket, Key: file.s3Key }), { expiresIn: 3600 })
    res.json({ downloadUrl: `https://placeholder-s3-url/${file.s3Key}`, expiresIn: 3600 })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', agencyOnly, async (req, res) => {
  try {
    await File.findByIdAndUpdate(req.params.id, { deletedAt: new Date() })
    res.json({ message: 'File deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
