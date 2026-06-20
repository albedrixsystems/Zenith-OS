import { FolderOpen, FileText, CheckCircle, Receipt, Download, Clock, CheckCheck, XCircle } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Progress, InvoiceStatusBadge, ApprovalStatusBadge, Modal } from '../components/ui/index'
import { mockProjects, mockFiles, mockApprovals, mockInvoices } from '../lib/mockData'
import { formatCurrency, formatDate, formatFileSize, getFileIcon } from '../lib/utils'
import { useState } from 'react'

// Filter to client c1 (Nova Tech) for the portal demo
const clientProjects = mockProjects.filter(p => p.clientId === 'c1')
const clientFiles = mockFiles.filter(f => clientProjects.map(p => p.id).includes(f.projectId))
const clientApprovals = mockApprovals.filter(a => a.clientId === 'c1')
const clientInvoices = mockInvoices.filter(i => i.clientId === 'c1')

export default function ClientPortalPage() {
  const [approvalModal, setApprovalModal] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const selected = clientApprovals.find(a => a.id === approvalModal)

  return (
    <Layout title="My Portal">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e293b 100%)' }}
      >
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F4511E, transparent)' }} />
        <p className="text-sm text-slate-400 mb-1">Welcome back,</p>
        <h1 className="text-2xl font-bold mb-1">Nova Tech Solutions</h1>
        <p className="text-slate-400 text-sm">
          You have <span className="text-white font-semibold">{clientApprovals.filter(a => a.status === 'pending_review').length} approvals</span> waiting and{' '}
          <span className="text-white font-semibold">{clientInvoices.filter(i => i.status !== 'paid').length} invoice</span> outstanding.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Projects', value: clientProjects.filter(p => p.status === 'active').length, icon: <FolderOpen size={16} style={{ color: '#F4511E' }} />, bg: 'bg-orange-50' },
          { label: 'Shared Files', value: clientFiles.length, icon: <FileText size={16} className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Pending Approvals', value: clientApprovals.filter(a => a.status === 'pending_review').length, icon: <CheckCircle size={16} className="text-amber-500" />, bg: 'bg-amber-50' },
          { label: 'Invoices', value: clientInvoices.length, icon: <Receipt size={16} className="text-emerald-500" />, bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold text-navy-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Projects */}
        <div className="card p-5">
          <h2 className="section-title mb-4">My Projects</h2>
          <div className="space-y-5">
            {clientProjects.map(project => (
              <div key={project.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-navy-900">{project.name}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${project.status === 'active' ? 'bg-blue-50 text-blue-600' :
                      project.status === 'review' ? 'bg-amber-50 text-amber-600' :
                      project.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <Progress value={project.progress} showLabel />
                <p className="text-xs text-slate-400 mt-1.5">
                  {project.completedTasks} of {project.taskCount} tasks done · Deadline {formatDate(project.deadline)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Approvals Needed</h2>
          {clientApprovals.filter(a => a.status === 'pending_review').length === 0 ? (
            <div className="text-center py-8">
              <CheckCheck size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">All caught up! No approvals pending.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientApprovals.filter(a => a.status === 'pending_review').map(approval => (
                <div key={approval.id} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{approval.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{approval.projectName}</p>
                    </div>
                    <Clock size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{approval.description}</p>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      onClick={() => setApprovalModal(approval.id)}
                    >
                      <CheckCheck size={13} /> Approve
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                      onClick={() => setApprovalModal(approval.id)}
                    >
                      <XCircle size={13} /> Request Changes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Files */}
      <div className="card p-5 mb-6">
        <h2 className="section-title mb-4">Shared Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clientFiles.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-navy-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(file.size)} · v{file.version}</p>
              </div>
              <button className="btn-ghost p-1.5 text-slate-400 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="section-title">My Invoices</h2>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-header text-left">Invoice</th>
              <th className="table-header text-left">Project</th>
              <th className="table-header text-left">Amount</th>
              <th className="table-header text-left">Due Date</th>
              <th className="table-header text-left">Status</th>
              <th className="table-header text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {clientInvoices.map(inv => (
              <tr key={inv.id} className="table-row">
                <td className="table-cell font-semibold text-sm text-navy-900">{inv.invoiceNumber}</td>
                <td className="table-cell text-sm text-slate-500 max-w-[140px] truncate">{inv.projectName}</td>
                <td className="table-cell text-sm font-bold text-navy-900">{formatCurrency(inv.total)}</td>
                <td className="table-cell text-sm text-slate-500">{formatDate(inv.dueDate)}</td>
                <td className="table-cell"><InvoiceStatusBadge status={inv.status} /></td>
                <td className="table-cell">
                  {inv.status !== 'paid' ? (
                    <button className="btn-primary text-xs py-1.5 px-3">Pay Now</button>
                  ) : (
                    <button className="btn-ghost text-xs py-1.5 px-2 text-slate-500">
                      <Download size={12} /> Receipt
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approval Response Modal */}
      <Modal open={!!approvalModal} onClose={() => setApprovalModal(null)} title="Respond to Approval" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-navy-900 mb-1">{selected.title}</p>
              <p className="text-xs text-slate-500">{selected.description}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Your Comment</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="input h-24 resize-none"
                placeholder="Add a comment or note for the team..."
              />
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                onClick={() => setApprovalModal(null)}
              >
                <CheckCheck size={15} /> Approve
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                onClick={() => setApprovalModal(null)}
              >
                <XCircle size={15} /> Request Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
