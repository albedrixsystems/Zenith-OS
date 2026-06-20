import { Bell, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mockNotifications } from '../../lib/mockData'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const unread = mockNotifications.filter(n => !n.read).length

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 sticky top-0 z-30">
      {title && (
        <h1 className="text-lg font-semibold text-navy-900 hidden md:block">{title}</h1>
      )}

      <div className="flex-1 max-w-sm ml-auto md:ml-0">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, projects..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-transparent text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-200 transition-all"
          />
        </div>
      </div>

      <Link to="/notifications" className="relative btn-ghost p-2 text-slate-500">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
        )}
      </Link>
    </header>
  )
}
