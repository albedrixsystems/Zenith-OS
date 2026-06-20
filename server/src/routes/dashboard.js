const express = require('express')
const router = express.Router()
const { Client, Project, Invoice, Payment, Approval, ActivityLog, Notification, File } = require('../models')
const { authenticate, agencyOnly } = require('../middleware/auth')

router.use(authenticate, agencyOnly)

router.get('/', async (req, res) => {
  try {
    const [
      totalClients, activeProjects, pendingApprovals,
      paidInvoices, unpaidInvoices, recentActivity
    ] = await Promise.all([
      Client.countDocuments({ status: 'active', deletedAt: null }),
      Project.countDocuments({ status: 'active', deletedAt: null }),
      Approval.countDocuments({ status: 'pending_review' }),
      Invoice.find({ status: 'paid' }).select('total paidAt'),
      Invoice.find({ status: { $in: ['sent', 'overdue'] } }).select('total'),
      ActivityLog.find().populate('userId', 'name').sort({ createdAt: -1 }).limit(10),
    ])

    const monthlyRevenue = paidInvoices
      .filter(i => new Date(i.paidAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((s, i) => s + i.total, 0)

    res.json({
      totalClients,
      activeProjects,
      pendingApprovals,
      monthlyRevenue,
      outstandingPayments: unpaidInvoices.reduce((s, i) => s + i.total, 0),
      recentActivity,
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
