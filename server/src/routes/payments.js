const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const { Payment, Invoice, ActivityLog, Notification } = require('../models')
const { authenticate } = require('../middleware/auth')

router.use(authenticate)

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { invoiceId } = req.body
    const invoice = await Invoice.findById(invoiceId).populate('clientId', 'companyName')
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' })
    if (invoice.status === 'paid') return res.status(400).json({ error: 'Invoice already paid' })

    // Razorpay order creation
    // In production, initialize: const Razorpay = require('razorpay')
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    // const order = await razorpay.orders.create({ amount: invoice.total * 100, currency: 'INR', receipt: invoice.invoiceNumber })

    // Mock response for demo
    const order = {
      id: `order_${Date.now()}`,
      amount: invoice.total * 100,
      currency: 'INR',
      receipt: invoice.invoiceNumber,
    }

    res.json({ order, key: process.env.RAZORPAY_KEY_ID, invoice })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Verify payment & update DB
router.post('/verify', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, invoiceId } = req.body

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret')
      .update(body).digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Payment verification failed' })
    }

    // Update invoice
    const invoice = await Invoice.findByIdAndUpdate(invoiceId, { status: 'paid', paidAt: new Date() }, { new: true })

    // Create payment record
    const payment = await Payment.create({
      invoiceId,
      clientId: invoice.clientId,
      amount: invoice.total,
      currency: 'INR',
      method: 'Razorpay',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'success',
    })

    await ActivityLog.create({ action: 'payment received', entityType: 'payment', entityId: payment._id, entityName: `₹${invoice.total}`, userId: req.user._id })

    // TODO: Send receipt email via Resend
    res.json({ message: 'Payment verified successfully', payment })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/', async (req, res) => {
  try {
    const query = req.user.role === 'client' ? { clientId: req.user.clientId } : {}
    const payments = await Payment.find(query).populate('invoiceId', 'invoiceNumber').populate('clientId', 'companyName').sort({ createdAt: -1 })
    res.json(payments)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
