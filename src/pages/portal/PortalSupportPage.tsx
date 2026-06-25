import { useState, useEffect, useRef } from 'react'
import { LifeBuoy, Plus, MessageSquare, Send, Clock, User, X } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { EmptyState, Modal, Skeleton } from '../../components/ui/index'
import { formatDate } from '../../lib/utils'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../context/LanguageContext'

export default function PortalSupportPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const isViewer = user?.role === 'client_viewer'
  const toast = useToast()

  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [newTicketModal, setNewTicketModal] = useState(false)

  // Form states
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')

  // Chat message state
  const [reply, setReply] = useState('')
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const fetchTickets = (autoSelectId?: string) => {
    setLoading(true)
    api.get('/support')
      .then(res => {
        setTickets(res.data || [])
        setLoading(false)
        if (autoSelectId) {
          const updated = res.data.find((t: any) => t.id === autoSelectId)
          if (updated) setSelectedTicket(updated)
        } else if (selectedTicket) {
          const updated = res.data.find((t: any) => t.id === selectedTicket.id)
          if (updated) setSelectedTicket(updated)
        }
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedTicket?.messages])

  const handleCreateTicket = () => {
    if (!subject.trim() || !description.trim()) {
      toast.error('Subject and description are required')
      return
    }

    api.post('/support', { subject, description, priority })
      .then(res => {
        toast.success('Support ticket created successfully!')
        setNewTicketModal(false)
        setSubject('')
        setDescription('')
        setPriority('medium')
        fetchTickets(res.data.id)
      })
      .catch(err => {
        toast.error(err.response?.data?.error || err.message)
      })
  }

  const handleSendReply = () => {
    if (!reply.trim() || !selectedTicket) return

    api.post(`/support/${selectedTicket.id}/messages`, { message: reply })
      .then(res => {
        setReply('')
        fetchTickets(selectedTicket.id)
      })
      .catch(err => {
        toast.error(err.response?.data?.error || err.message)
      })
  }

  return (
    <Layout title="Support Center">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 text-sm mt-1">Submit issues, ask queries, and review response logs with the agency team.</p>
        </div>

        <button
          className="btn-primary gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-50"
          disabled={isViewer}
          onClick={() => setNewTicketModal(true)}
        >
          <Plus size={15} /> Create Ticket
        </button>
      </div>

      {loading && tickets.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No support tickets"
          description="Have queries or issues? Create your first support ticket."
          icon={<LifeBuoy size={48} />}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[450px]">
          {/* Sidebar tickets list */}
          <div className="lg:col-span-1 card p-0 overflow-y-auto flex flex-col h-full border border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-navy-900 text-xs uppercase tracking-wider">Ticket Directory</h3>
            </div>
            <div className="flex-1 divide-y divide-slate-100">
              {tickets.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-4 transition-colors hover:bg-slate-50/50 flex flex-col gap-1.5 cursor-pointer
                    ${selectedTicket?.id === t.id ? 'bg-orange-50/30 border-r-2 border-orange-500' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase
                      ${t.priority === 'high' ? 'bg-rose-50 text-rose-600' :
                        t.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      {t.priority}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase
                      ${t.status === 'open' ? 'bg-orange-50 text-orange-600 animate-pulse' :
                        t.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                        t.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-navy-900 line-clamp-1">{t.subject}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Updated: {formatDate(t.updatedAt)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Messages Pane */}
          <div className="lg:col-span-2 card p-0 flex flex-col h-full border border-slate-200 overflow-hidden">
            {selectedTicket ? (
              <div className="flex flex-col h-full">
                {/* Chat header */}
                <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/30 flex-shrink-0">
                  <div>
                    <h3 className="font-bold text-navy-900 text-base leading-snug">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ticket ID: <span className="font-mono">{selectedTicket.id}</span> · Status: <span className="capitalize">{selectedTicket.status.replace('_', ' ')}</span></p>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 lg:hidden cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
                  {selectedTicket.messages?.map((msg: any, i: number) => {
                    const isOwnMessage = msg.senderId === user?.id
                    return (
                      <div key={i} className={`flex items-start gap-3.5 max-w-[80%] ${isOwnMessage ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0
                          ${isOwnMessage ? 'bg-orange-500 text-white' : 'bg-navy-900 text-white'}`}>
                          {msg.senderName.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed
                            ${isOwnMessage ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                            {msg.message}
                          </div>
                          <span className={`text-[9px] text-slate-400 block px-1 ${isOwnMessage ? 'text-right' : ''}`}>
                            {msg.senderName} · {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input panel */}
                {selectedTicket.status !== 'closed' ? (
                  <div className="p-3 border-t border-slate-150 bg-white flex items-center gap-2.5 flex-shrink-0">
                    <textarea
                      className="flex-1 input min-h-[40px] max-h-[80px] h-[40px] py-2 resize-none text-xs"
                      placeholder="Type your response messages here..."
                      value={reply}
                      disabled={isViewer}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendReply()
                        }
                      }}
                    />
                    <button
                      className="btn-primary p-2 h-10 w-10 flex items-center justify-center flex-shrink-0 cursor-pointer disabled:opacity-50"
                      disabled={isViewer || !reply.trim()}
                      onClick={handleSendReply}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border-t border-slate-150 bg-slate-50 text-center text-xs text-slate-400 flex-shrink-0">
                    This support ticket has been closed. Create a new support ticket if issues persist.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
                <MessageSquare size={40} className="text-slate-300 mb-2.5" />
                <p className="text-sm font-semibold">Select a ticket to review messaging thread</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">Open a ticket details panel from the ticket list directory on the left.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal open={newTicketModal} onClose={() => setNewTicketModal(false)} title="Open Support Ticket / Query" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Subject *</label>
            <input
              type="text"
              className="input text-xs"
              placeholder="e.g. Broken links on dashboard"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Classification</label>
            <select
              className="input text-xs"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low - Minor Inquiry</option>
              <option value="medium">Medium - General Issue</option>
              <option value="high">High - Critical Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Reproduction Steps *</label>
            <textarea
              className="input text-xs h-28 resize-none"
              placeholder="Provide a complete description of the query or request, including details of the problem and steps to reproduce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button className="flex-1 btn-secondary text-xs cursor-pointer py-2" onClick={() => setNewTicketModal(false)}>{t('cancel')}</button>
            <button
              className="flex-1 btn-primary text-xs justify-center cursor-pointer disabled:opacity-50"
              disabled={!subject.trim() || !description.trim()}
              onClick={handleCreateTicket}
            >
              Submit Ticket
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
