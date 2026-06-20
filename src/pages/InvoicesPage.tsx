import { useState } from 'react'
import { Plus, Send, Download, Eye, IndianRupee } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { InvoiceStatusBadge, EmptyState, Modal } from '../components/ui/index'
import { mockInvoices } from '../lib/mockData'
import { formatCurrency, formatDate } from '../lib/utils'
import type { InvoiceStatus } from '../types'
import { useNavigate } from 'react-router-dom'

export default function InvoicesPage() {
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all')
  const [customRange, setCustomRange] = useState<{ from: string; to: string }>({ from: '', to: '' })

  const navigate = useNavigate()

  const filtered = mockInvoices.filter(i => {
    const statusMatch = filter === 'all' || i.status === filter
    let dateMatch = true
    const invDate = new Date(i.createdAt)
    const today = new Date()
    switch (dateFilter) {
      case 'today':
        dateMatch = invDate.toDateString() === today.toDateString()
        break
      case 'week': {
        const weekStart = new Date()
        weekStart.setDate(today.getDate() - today.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        dateMatch = invDate >= weekStart && invDate <= weekEnd
        break
      }
      case 'month':
        dateMatch = invDate.getMonth() === today.getMonth() && invDate.getFullYear() === today.getFullYear()
        break
      case 'year':
        dateMatch = invDate.getFullYear() === today.getFullYear()
        break
      case 'custom':
        if (customRange.from && customRange.to) {
          const from = new Date(customRange.from)
          const to = new Date(customRange.to)
          dateMatch = invDate >= from && invDate <= to
        }
        break
      default:
        dateMatch = true
    }
    return statusMatch && dateMatch
  })

  const selectedInvoice = mockInvoices.find(i => i.id === selected)

  const totals = {
    total: mockInvoices.reduce((s, i) => s + i.total, 0),
    paid: mockInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    outstanding: mockInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.total, 0),
  }

  return (
    <Layout title="Invoices">
      <div className="page-header flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{mockInvoices.length} invoices · {mockInvoices.filter(i => i.status === 'paid').length} paid</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/invoices/create')}>
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Billed', value: totals.total, color: 'text-navy-900' },
          { label: 'Collected', value: totals.paid, color: 'text-emerald-600' },
          { label: 'Outstanding', value: totals.outstanding, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xs text-slate-500 mb-1.5">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-4">
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === s ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {s} {s !== 'all' && `(${mockInvoices.filter(i => i.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium">Date:</label>
        <select className="input" value={dateFilter} onChange={e => setDateFilter(e.target.value as any)}>
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
        {dateFilter === 'custom' && (
          <>
            <input type="date" className="input" value={customRange.from} onChange={e => setCustomRange(prev => ({ ...prev, from: e.target.value }))} />
            <span>–</span>
            <input type="date" className="input" value={customRange.to} onChange={e => setCustomRange(prev => ({ ...prev, to: e.target.value }))} />
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No invoices"
          description="Create your first invoice to send to clients."
          action={
            <button className="btn-primary" onClick={() => navigate('/invoices/create')}>
              <Plus size={15} /> Create Invoice
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-header text-left">Invoice</th>
                <th className="table-header text-left">Client</th>
                <th className="table-header text-left">Project</th>
                <th className="table-header text-left">Amount</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Due Date</th>
                <th className="table-header text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className="table-row cursor-pointer" onClick={() => setSelected(inv.id)}>
                  <td className="table-cell">
                    <p className="font-semibold text-navy-900 text-sm">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">{formatDate(inv.createdAt)}</p>
                  </td>
                  <td className="table-cell text-sm text-slate-700">{inv.clientName}</td>
                  <td className="table-cell text-sm text-slate-500 max-w-[150px] truncate">{inv.projectName}</td>
                  <td className="table-cell">
                    <p className="text-sm font-bold text-navy-900">{formatCurrency(inv.total)}</p>
                    <p className="text-xs text-slate-400">incl. tax</p>
                  </td>
                  <td className="table-cell"><InvoiceStatusBadge status={inv.status} /></td>
                  <td className={`table-cell text-sm font-medium ${inv.status === 'overdue' ? 'text-rose-600' : 'text-slate-600'}`}>{formatDate(inv.dueDate)}</td>
                  <td className="table-cell" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost p-1.5 text-slate-400 hover:text-navy-900" title="View"><Eye size={14} /></button>
                      <button className="btn-ghost p-1.5 text-slate-400 hover:text-orange-600" title="Download"><Download size={14} /></button>
                      {inv.status === 'draft' && (
                        <button className="btn-ghost p-1.5 text-slate-400 hover:text-blue-600" title="Send"><Send size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Invoice Details" size="lg">
        {selectedInvoice && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-navy-900">{selectedInvoice.invoiceNumber}</p>
                <p className="text-sm text-slate-500 mt-0.5">{selectedInvoice.clientName} · {selectedInvoice.projectName}</p>
              </div>
              <InvoiceStatusBadge status={selectedInvoice.status} />
            </div>

            <div className="bg-slate-50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Description</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Qty</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Rate</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-700">{item.description}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.rate)}</td>
                      <td className="px-4 py-3 text-right font-medium text-navy-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>GST (18%)</span>
                  <span>{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-navy-900 pt-1 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1 justify-center"><Download size={15} /> Download PDF</button>
              {selectedInvoice.status !== 'paid' && (
                <button className="btn-primary flex-1 justify-center"><IndianRupee size={15} /> Pay Now</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Invoice Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Invoice" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Client *</label>
              <select className="input">
                <option>Nova Tech Solutions</option>
                <option>Meridian Hospitality</option>
                <option>GreenLeaf Organics</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Project *</label>
              <select className="input">
                <option>Brand Identity Redesign</option>
                <option>Website UI/UX Design</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Line Items</label>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1">
                <span className="col-span-6">Description</span>
                <span className="col-span-2">Qty</span>
                <span className="col-span-2">Rate (₹)</span>
                <span className="col-span-2">Amount</span>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <input className="input col-span-6 py-2 text-sm" placeholder="Service description" />
                <input type="number" className="input col-span-2 py-2 text-sm" placeholder="1" />
                <input type="number" className="input col-span-2 py-2 text-sm" placeholder="50000" />
                <span className="col-span-2 text-sm font-medium text-navy-900 pl-2">₹0</span>
              </div>
            </div>
            <button className="text-xs text-orange-600 font-semibold mt-2 hover:underline">+ Add line item</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Due Date *</label>
              <input type="date" className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tax (%)</label>
              <input type="number" className="input" placeholder="18" defaultValue="18" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>Save as Draft</button>
            <button className="btn-primary flex-1 justify-center" onClick={() => setShowCreate(false)}>
              <Send size={15} /> Create &amp; Send
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
