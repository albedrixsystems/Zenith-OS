import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { mockNotifications } from '../lib/mockData'
import { formatRelativeTime } from '../lib/utils'

const TYPE_ICONS: Record<string, string> = {
  client_added: '👤',
  project_assigned: '📁',
  approval_requested: '✅',
  invoice_generated: '🧾',
  payment_received: '💰',
  deadline_approaching: '⏰',
}

export default function NotificationsPage() {
  const unread = mockNotifications.filter(n => !n.read)
  const read = mockNotifications.filter(n => n.read)

  return (
    <Layout title="Notifications">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread.length} unread</p>
        </div>
        <button className="btn-ghost text-xs text-slate-500">
          <CheckCheck size={14} /> Mark all as read
        </button>
      </div>

      <div className="max-w-2xl space-y-6">
        {unread.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Unread</p>
            <div className="space-y-2">
              {unread.map(n => (
                <div key={n.id} className="card p-4 flex items-start gap-3 border-l-4 border-orange-400">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-base flex-shrink-0">
                    {TYPE_ICONS[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900">{n.title}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  <button className="btn-ghost p-1.5 text-slate-300 hover:text-slate-500 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {read.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Earlier</p>
            <div className="space-y-2">
              {read.map(n => (
                <div key={n.id} className="card p-4 flex items-start gap-3 opacity-70">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-base flex-shrink-0">
                    {TYPE_ICONS[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900">{n.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  <button className="btn-ghost p-1.5 text-slate-300 hover:text-slate-500 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mockNotifications.length === 0 && (
          <div className="card p-16 text-center">
            <Bell size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="font-semibold text-slate-600">You're all caught up</p>
            <p className="text-sm text-slate-400 mt-1">No new notifications</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
