import { useState, useEffect } from 'react'
import { 
  CheckCircle, XCircle, Clock, MessageSquare, FileText, CheckCheck, 
  Plus, Calendar, AlertTriangle, User, Folder, Download, Send, RefreshCw, Paperclip 
} from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { ApprovalStatusBadge, EmptyState, Modal } from '../components/ui/index'
import { formatRelativeTime, formatDate } from '../lib/utils'
import type { ApprovalStatus } from '../types'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'

export default function ApprovalsPage() {
  const toast = useToast()
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'awaiting_review' | 'sent_to_client' | 'completed'>('awaiting_review')
  
  // Selection and details
  const [selected, setSelected] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [generalComment, setGeneralComment] = useState('')
  
  // Data lists
  const [approvals, setApprovals] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal toggle
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Form states
  const [createTitle, setCreateTitle] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createClientId, setCreateClientId] = useState('')
  const [createProjectId, setCreateProjectId] = useState('')
  const [createRequestType, setCreateRequestType] = useState('deliverable')
  const [createPriority, setCreatePriority] = useState('medium')
  const [createDueDate, setCreateDueDate] = useState('')
  const [createAssignedApproverId, setCreateAssignedApproverId] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchApprovals = () => {
    setLoading(true)
    api.get('/approvals')
      .then(res => {
        setApprovals(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const fetchMetaData = () => {
    // Fetch clients
    api.get('/clients?limit=1000')
      .then(res => setClients(res.data.clients || []))
      .catch(err => console.error(err))

    // Fetch projects
    api.get('/projects?limit=1000')
      .then(res => setProjects(res.data.projects || []))
      .catch(err => console.error(err))

    // Fetch users (client portal users and team members)
    api.get('/auth/users')
      .then(res => setUsersList(res.data || []))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchApprovals()
    fetchMetaData()
  }, [])

  const resetForm = () => {
    setCreateTitle('')
    setCreateDescription('')
    setCreateClientId('')
    setCreateProjectId('')
    setCreateRequestType('deliverable')
    setCreatePriority('medium')
    setCreateDueDate('')
    setCreateAssignedApproverId('')
    setSelectedFiles(null)
  }

  const handleCreateApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createTitle || !createClientId || !createProjectId || !createRequestType) {
      toast.error('Please fill in all required fields.')
      return
    }
    setIsSubmitting(true)
    try {
      let uploadedFileIds: string[] = []
      if (selectedFiles && selectedFiles.length > 0) {
        const formData = new FormData()
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('files', selectedFiles[i])
        }
        formData.append('projectId', createProjectId)
        formData.append('isClientVisible', 'true')
        
        const uploadRes = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const uploadedFiles = Array.isArray(uploadRes.data) ? uploadRes.data : [uploadRes.data]
        uploadedFileIds = uploadedFiles.map((f: any) => f.id || f._id)
      }

      const payload = {
        title: createTitle,
        description: createDescription,
        clientId: createClientId,
        projectId: createProjectId,
        requestType: createRequestType,
        priority: createPriority,
        dueDate: createDueDate || undefined,
        assignedApproverId: createAssignedApproverId || undefined,
        fileIds: uploadedFileIds
      }

      await api.post('/approvals', payload)
      toast.success('Approval request created successfully.')
      setShowCreateModal(false)
      resetForm()
      fetchApprovals()
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRespond = (id: string, status: 'approved' | 'rejected' | 'revision_requested') => {
    if (['rejected', 'revision_requested'].includes(status) && !comment.trim()) {
      toast.error('Comments are mandatory when rejecting or requesting revisions.')
      return
    }

    api.put(`/approvals/${id}/respond`, { status, clientComment: comment })
      .then(() => {
        fetchApprovals()
        setSelected(null)
        setComment('')
        toast.success(`Approval response submitted successfully.`)
      })
      .catch(err => {
        toast.error(err.response?.data?.error || err.message)
      })
  }

  const handleAddComment = (id: string) => {
    if (!generalComment.trim()) return

    api.post(`/approvals/${id}/comment`, { comment: generalComment })
      .then(res => {
        setGeneralComment('')
        // Refresh detail list item
        setApprovals(prev => prev.map(a => a.id === id ? res.data : a))
        toast.success('Comment added to timeline.')
      })
      .catch(err => {
        toast.error(err.response?.data?.error || err.message)
      })
  }

  const handleCancelRequest = (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this approval request?')) return

    api.put(`/approvals/${id}/cancel`)
      .then(() => {
        fetchApprovals()
        setSelected(null)
        toast.success('Approval request cancelled.')
      })
      .catch(err => {
        toast.error(err.response?.data?.error || err.message)
      })
  }

  // Filter approvals based on tab
  const awaitingReview = approvals.filter(a => ['pending_admin_approval', 'pending_review'].includes(a.status))
  const sentToClient = approvals.filter(a => a.status === 'pending_client_approval')
  const completed = approvals.filter(a => ['approved', 'rejected', 'revision_requested', 'cancelled', 'draft'].includes(a.status))

  const activeList = 
    activeTab === 'awaiting_review' ? awaitingReview :
    activeTab === 'sent_to_client' ? sentToClient : completed

  const selectedApproval = approvals.find(a => a.id === selected)

  // Filter projects by client
  const clientProjects = projects.filter(p => p.clientId?._id === createClientId || p.clientId === createClientId)

  // Filter users by client to find contact persons
  const clientContacts = usersList.filter(u => u.clientId === createClientId || u.clientId?._id === createClientId)

  const getActionText = (action: string) => {
    switch (action) {
      case 'created': return 'created the request'
      case 'approved': return 'approved & signed'
      case 'rejected': return 'rejected the request'
      case 'revision_requested': return 'requested revision / more details'
      case 'comment_added': return 'added a comment'
      case 'cancelled': return 'cancelled the request'
      default: return action
    }
  }

  return (
    <Layout title="Approvals">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">{awaitingReview.length} awaiting my review · {sentToClient.length} pending client sign-off</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn-primary flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} /> Create Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        <button 
          onClick={() => setActiveTab('awaiting_review')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'awaiting_review' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Awaiting Review ({awaitingReview.length})
        </button>
        <button 
          onClick={() => setActiveTab('sent_to_client')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'sent_to_client' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Sent to Clients ({sentToClient.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'completed' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Completed & History ({completed.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-orange-600" />
        </div>
      ) : activeList.length === 0 ? (
        <EmptyState 
          icon="📦" 
          title="No approvals found" 
          description="There are no approval requests matching this tab's state." 
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header text-left pl-6">Request ID</th>
                <th className="table-header text-left">Title</th>
                <th className="table-header text-left">Project</th>
                <th className="table-header text-left">Client</th>
                <th className="table-header text-left">Type</th>
                <th className="table-header text-left">Priority</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Date</th>
                <th className="table-header text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeList.map(approval => (
                <tr key={approval.id} className="table-row hover:bg-slate-50/55 cursor-pointer" onClick={() => setSelected(approval.id)}>
                  <td className="table-cell pl-6 font-mono text-xs text-slate-500">#{approval.id.substring(approval.id.length - 6).toUpperCase()}</td>
                  <td className="table-cell font-semibold text-navy-900">{approval.title}</td>
                  <td className="table-cell text-slate-600">{approval.projectName}</td>
                  <td className="table-cell text-slate-600">{approval.clientName}</td>
                  <td className="table-cell uppercase text-[10px] font-bold text-slate-500">{approval.requestType?.replace('_', ' ')}</td>
                  <td className="table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                      ${approval.priority === 'critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                        approval.priority === 'high' ? 'bg-amber-50 text-amber-600' :
                        approval.priority === 'medium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      {approval.priority}
                    </span>
                  </td>
                  <td className="table-cell"><ApprovalStatusBadge status={approval.status} /></td>
                  <td className="table-cell text-xs text-slate-400">{formatDate(approval.createdAt)}</td>
                  <td className="table-cell">
                    <button className="text-xs text-orange-600 hover:text-orange-700 font-bold" onClick={(e) => { e.stopPropagation(); setSelected(approval.id); }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create Approval Request" size="lg">
        <form onSubmit={handleCreateApproval} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Client *</label>
              <select 
                value={createClientId} 
                onChange={e => { setCreateClientId(e.target.value); setCreateProjectId(''); setCreateAssignedApproverId(''); }} 
                className="input"
                required
              >
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Related Project *</label>
              <select 
                value={createProjectId} 
                onChange={e => setCreateProjectId(e.target.value)} 
                className="input"
                required
                disabled={!createClientId}
              >
                <option value="">Select Project</option>
                {clientProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Request Type *</label>
              <select 
                value={createRequestType} 
                onChange={e => setCreateRequestType(e.target.value)} 
                className="input"
                required
              >
                <option value="deliverable">Deliverable Sign-off</option>
                <option value="design">Design Approval</option>
                <option value="creative">Creative Approval</option>
                <option value="branding">Branding Assets</option>
                <option value="website">Website Development</option>
                <option value="marketing">Marketing Campaigns</option>
                <option value="invoice">Invoice Verification</option>
                <option value="change_request">Change Request</option>
                <option value="scope_change">Scope Change</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Client Approver</label>
              <select 
                value={createAssignedApproverId} 
                onChange={e => setCreateAssignedApproverId(e.target.value)} 
                className="input"
                disabled={!createClientId}
              >
                <option value="">All Client Admins</option>
                {clientContacts.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Approval Title *</label>
            <input 
              type="text" 
              value={createTitle} 
              onChange={e => setCreateTitle(e.target.value)} 
              className="input" 
              placeholder="e.g. Logo Design V2 Draft Sign-off"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Review Guidelines</label>
            <textarea 
              value={createDescription} 
              onChange={e => setCreateDescription(e.target.value)} 
              className="input h-20 resize-none" 
              placeholder="Provide context or guidelines for the approver..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select 
                value={createPriority} 
                onChange={e => setCreatePriority(e.target.value)} 
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input 
                type="date" 
                value={createDueDate} 
                onChange={e => setCreateDueDate(e.target.value)} 
                className="input" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Files / Deliverables</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <input 
                type="file" 
                multiple 
                onChange={e => setSelectedFiles(e.target.files)} 
                className="hidden" 
                id="creationAttachments" 
              />
              <label htmlFor="creationAttachments" className="cursor-pointer text-center">
                <Paperclip className="mx-auto text-slate-400 mb-2" size={24} />
                <span className="text-xs font-bold text-orange-600 hover:underline block">Choose files from computer</span>
                <span className="text-[10px] text-slate-400 block mt-1">Supports Images, PDFs, and Documents</span>
              </label>
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-3 w-full bg-white rounded-lg border border-slate-100 p-2.5 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Files Selected ({selectedFiles.length})</p>
                  {Array.from(selectedFiles).map((f, i) => (
                    <div key={i} className="text-xs text-navy-900 truncate flex items-center gap-1.5">
                      <FileText size={12} className="text-slate-400" /> {f.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              className="flex-1 btn-secondary justify-center py-2.5 cursor-pointer" 
              onClick={() => { setShowCreateModal(false); resetForm(); }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-primary justify-center py-2.5 cursor-pointer disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Approval Detail & History" size="lg">
        {selectedApproval && (
          <div className="space-y-6">
            {/* Header / Info Row */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-navy-900">{selectedApproval.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase tracking-wide">{selectedApproval.requestType?.replace('_', ' ')}</span>
                    <span>&middot;</span>
                    <span>Project: <span className="font-semibold text-navy-900">{selectedApproval.projectName}</span></span>
                    <span>&middot;</span>
                    <span>Client: <span className="font-semibold text-navy-900">{selectedApproval.clientName}</span></span>
                  </div>
                </div>
                <ApprovalStatusBadge status={selectedApproval.status} />
              </div>
            </div>

            {/* Description & Attachments Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-4">{selectedApproval.description || 'No description provided.'}</p>
                </div>

                {/* Meta list */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Requested By</span>
                    <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5 mt-1">
                      <User size={13} className="text-slate-400" /> {selectedApproval.requestedByName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Assigned Approver</span>
                    <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5 mt-1">
                      <User size={13} className="text-slate-400" /> {selectedApproval.assignedApproverName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Due Date</span>
                    <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5 mt-1">
                      <Calendar size={13} className="text-slate-400" /> {selectedApproval.dueDate ? formatDate(selectedApproval.dueDate) : 'No due date'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Priority</span>
                    <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5 mt-1">
                      <AlertTriangle size={13} className="text-slate-400" /> {selectedApproval.priority}
                    </span>
                  </div>
                </div>

                {/* Attached Files */}
                {selectedApproval.fileIds && selectedApproval.fileIds.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attached Files</h4>
                    <div className="space-y-1.5">
                      {selectedApproval.fileIds.map((file: any) => (
                        <div key={file._id || file.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText size={16} className="text-rose-500 flex-shrink-0" />
                            <span className="text-xs font-bold text-navy-900 truncate">{file.name}</span>
                          </div>
                          <button 
                            className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
                            onClick={() => window.open(`http://localhost:5000/api/files/download-raw/${file._id || file.id}`, '_blank')}
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Form for Client-initiated Requests */}
                {selectedApproval.status === 'pending_admin_approval' && (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Review Decision Response</h4>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">Add Remarks (Mandatory for rejection or revisions) *</label>
                      <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="input h-20 resize-none text-xs"
                        placeholder="Provide feedback details here..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleRespond(selectedApproval.id, 'approved')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                      >
                        <CheckCheck size={14} /> Approve Request
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleRespond(selectedApproval.id, 'revision_requested')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={14} /> Ask Revision
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleRespond(selectedApproval.id, 'rejected')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* General Comment Poster */}
                {selectedApproval.status !== 'cancelled' && selectedApproval.status !== 'approved' && (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Add Comment</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={generalComment}
                        onChange={e => setGeneralComment(e.target.value)}
                        className="input flex-1 text-xs" 
                        placeholder="Add a remark to this request's timeline..." 
                        onKeyDown={e => e.key === 'Enter' && handleAddComment(selectedApproval.id)}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleAddComment(selectedApproval.id)}
                        className="btn-primary py-2 px-3 flex items-center justify-center cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Cancel Trigger */}
                {['pending_client_approval', 'draft'].includes(selectedApproval.status) && (
                  <div className="border-t border-slate-100 pt-4">
                    <button 
                      type="button" 
                      onClick={() => handleCancelRequest(selectedApproval.id)}
                      className="btn-secondary py-2 px-3 text-xs text-rose-600 border-rose-100 hover:bg-rose-50 flex items-center gap-1.5 justify-center w-full cursor-pointer"
                    >
                      <XCircle size={14} /> Cancel Request Deliverable
                    </button>
                  </div>
                )}
              </div>

              {/* Status History Timeline (Span 2) */}
              <div className="lg:col-span-2 border-l border-slate-100 pl-6 space-y-4 max-h-[500px] overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Activity Timeline</h4>
                {selectedApproval.history && selectedApproval.history.length > 0 ? (
                  <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-5 py-1">
                    {selectedApproval.history.map((hist: any, idx: number) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <span className={`absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white flex-shrink-0
                          ${hist.action === 'approved' ? 'bg-emerald-500' :
                            hist.action === 'rejected' ? 'bg-rose-500' :
                            hist.action === 'revision_requested' ? 'bg-amber-500' :
                            hist.action === 'comment_added' ? 'bg-blue-500' : 'bg-slate-400'}`} 
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs text-slate-700">
                            <span className="font-bold text-navy-900">{hist.userName}</span>{' '}
                            <span className="text-slate-500">{getActionText(hist.action)}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">{formatRelativeTime(hist.createdAt)}</p>
                          {hist.comments && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 mt-1 text-xs text-slate-600 italic">
                              "{hist.comments}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No activity logs recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
