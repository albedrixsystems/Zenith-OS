import { useState } from 'react'
import { CreditCard, Smartphone, Building2, CheckCircle, IndianRupee } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Avatar, Modal } from '../components/ui/index'
import { mockPayments, mockInvoices } from '../lib/mockData'
import { formatCurrency, formatDate } from '../lib/utils'
import { useAuth } from '../context/AuthContext'

export default function PaymentsPage() {
  const [showRazorpay, setShowRazorpay] = useState(false)
  const [payStep, setPayStep] = useState<'method' | 'processing' | 'success'>('method')
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  const { user } = useAuth()
  const isAdmin = user?.role === 'super_admin'
  const totalCollected = mockPayments.reduce((s, p) => s + p.amount, 0)
  const pendingInvoices = mockInvoices.filter(i => i.status === 'sent' || i.status === 'overdue')


  const handlePay = () => {
    setPayStep('processing')
    setTimeout(() => setPayStep('success'), 2000)
  }

  const methods = [
    { id: 'upi', label: 'UPI', icon: <Smartphone size={18} />, desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={18} />, desc: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Net Banking', icon: <Building2 size={18} />, desc: 'All major banks' },
  ]

  return (
    <Layout title="Payments">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">{mockPayments.length} transactions recorded</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs text-slate-500 mb-1">Pending Invoices</p>
          <p className="text-2xl font-bold text-amber-600">
            {formatCurrency(pendingInvoices.reduce((s, i) => s + i.total, 0))}
          </p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs text-slate-500 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-rose-600">
            {formatCurrency(mockInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0))}
          </p>
        </div>
      </div>

      {/* Pending Invoices - Pay Now section */}
      {pendingInvoices.length > 0 && (
        <div className="mb-8">
          <h2 className="section-title mb-4">Awaiting Payment</h2>
          <div className="space-y-3">
            {pendingInvoices.map(inv => (
              <div key={inv.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm text-navy-900">{inv.invoiceNumber}</p>
                    {inv.status === 'overdue' && (
                      <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">Overdue</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{inv.clientName} · Due {formatDate(inv.dueDate)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-navy-900">{formatCurrency(inv.total)}</p>
                  {!isAdmin && (
                    <button
                      className="btn-primary py-2"
                      onClick={() => { setShowRazorpay(true); setPayStep('method') }}
                    >
                      <IndianRupee size={14} /> Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div>
        <h2 className="section-title mb-4">Transaction History</h2>
        {mockPayments.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 text-sm">No transactions yet.</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header text-left">Transaction</th>
                  <th className="table-header text-left">Client</th>
                  <th className="table-header text-left">Invoice</th>
                  <th className="table-header text-left">Method</th>
                  <th className="table-header text-left">Amount</th>
                  <th className="table-header text-left">Date</th>
                  <th className="table-header text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.map(payment => (
                  <tr key={payment.id} className="table-row">
                    <td className="table-cell">
                      <p className="text-xs font-mono text-slate-500">{payment.transactionId}</p>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar name={payment.clientName} size="sm" />
                        <span className="text-sm text-slate-700">{payment.clientName}</span>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-slate-600">{payment.invoiceNumber}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        {payment.method === 'UPI' && <Smartphone size={13} className="text-slate-400" />}
                        {payment.method === 'Bank Transfer' && <Building2 size={13} className="text-slate-400" />}
                        {payment.method === 'Card' && <CreditCard size={13} className="text-slate-400" />}
                        {payment.method}
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(payment.amount)}</p>
                    </td>
                    <td className="table-cell text-sm text-slate-500">{formatDate(payment.paidAt)}</td>
                    <td className="table-cell">
                      {payment.paidAt ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle size={12} /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <CheckCircle size={12} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Razorpay Payment Modal */}
      <Modal open={showRazorpay} onClose={() => { setShowRazorpay(false); setPayStep('method') }} title="Complete Payment" size="sm">
        {payStep === 'method' && (
          <div className="space-y-4">
            {/* Razorpay branding */}
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Paying</p>
              <p className="text-2xl font-bold text-navy-900">₹1,41,600</p>
              <p className="text-xs text-slate-400 mt-0.5">INV-2024-002 · Meridian Hospitality</p>
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Choose payment method</p>

            <div className="space-y-2">
              {methods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all
                    ${selectedMethod === m.id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    ${selectedMethod === m.id ? 'text-orange-600' : 'text-slate-500'}`}
                    style={selectedMethod === m.id ? { background: 'rgba(244,81,30,0.1)' } : { background: '#f1f5f9' }}
                  >
                    {m.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{m.label}</p>
                    <p className="text-xs text-slate-400">{m.desc}</p>
                  </div>
                  {selectedMethod === m.id && (
                    <CheckCircle size={16} className="ml-auto text-orange-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#94a3b8" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#94a3b8" strokeWidth="2"/>
              </svg>
              Secured by Razorpay
            </div>

            <button
              className="btn-primary w-full justify-center py-3"
              disabled={!selectedMethod}
              onClick={handlePay}
            >
              Pay ₹1,41,600
            </button>
          </div>
        )}

        {payStep === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse"
              style={{ background: 'linear-gradient(135deg, rgba(244,81,30,0.15), rgba(255,140,66,0.15))' }}>
              <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            </div>
            <p className="font-semibold text-navy-900 mb-1">Processing payment...</p>
            <p className="text-sm text-slate-500">Please wait, do not close this window.</p>
          </div>
        )}

        {payStep === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <CheckCircle size={32} className="text-white" />
            </div>
            <p className="text-xl font-bold text-navy-900 mb-1">Payment Successful!</p>
            <p className="text-sm text-slate-500 mb-1">₹1,41,600 received</p>
            <p className="text-xs text-slate-400 mb-6">A receipt has been sent to priya@meridian.in</p>
            <button
              className="btn-primary justify-center w-full"
              onClick={() => { setShowRazorpay(false); setPayStep('method') }}
            >
              Done
            </button>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
