import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { getInitials } from '../../lib/utils'
import type { ProjectStatus, TaskStatus, TaskPriority, InvoiceStatus, ApprovalStatus, ClientStatus } from '../../types'

// ── Badge ──────────────────────────────────────────────────────────
interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'brand' | 'purple'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    info: 'bg-blue-50 text-blue-700',
    default: 'bg-slate-100 text-slate-600',
    purple: 'bg-purple-50 text-purple-700',
    brand: 'text-white',
  }
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizes[size]} ${variants[variant]}`}
      style={variant === 'brand' ? { background: 'linear-gradient(135deg, #F4511E, #FF8C42)' } : undefined}
    >
      {children}
    </span>
  )
}

// Status badge helpers
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { label: string; variant: BadgeProps['variant'] }> = {
    draft: { label: 'Draft', variant: 'default' },
    active: { label: 'Active', variant: 'info' },
    review: { label: 'In Review', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
    archived: { label: 'Archived', variant: 'default' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; variant: BadgeProps['variant'] }> = {
    pending: { label: 'Pending', variant: 'default' },
    in_progress: { label: 'In Progress', variant: 'info' },
    review: { label: 'Review', variant: 'warning' },
    done: { label: 'Done', variant: 'success' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, { label: string; variant: BadgeProps['variant'] }> = {
    low: { label: 'Low', variant: 'default' },
    medium: { label: 'Medium', variant: 'info' },
    high: { label: 'High', variant: 'warning' },
    critical: { label: 'Critical', variant: 'danger' },
  }
  const { label, variant } = map[priority]
  return <Badge variant={variant}>{label}</Badge>
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const map: Record<InvoiceStatus, { label: string; variant: BadgeProps['variant'] }> = {
    draft: { label: 'Draft', variant: 'default' },
    sent: { label: 'Sent', variant: 'info' },
    paid: { label: 'Paid', variant: 'success' },
    overdue: { label: 'Overdue', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  const map: Record<ApprovalStatus, { label: string; variant: BadgeProps['variant'] }> = {
    pending_review: { label: 'Pending Review', variant: 'warning' },
    approved: { label: 'Approved', variant: 'success' },
    revision_requested: { label: 'Revision Requested', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const map: Record<ClientStatus, { label: string; variant: BadgeProps['variant'] }> = {
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'default' },
    lead: { label: 'Lead', variant: 'purple' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

// ── Avatar ──────────────────────────────────────────────────────────
interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  src?: string
}

export function Avatar({ name, size = 'md', src }: AvatarProps) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }

  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg, #F4511E, #FF8C42)' }}
    >
      {getInitials(name)}
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────
interface ProgressProps {
  value: number
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function Progress({ value, size = 'sm', showLabel = false }: ProgressProps) {
  const heights = { sm: 'h-1.5', md: 'h-2.5' }
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${heights[size]} rounded-full bg-slate-100 overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-700`}
          style={{ width: `${value}%`, background: 'linear-gradient(135deg, #F4511E, #FF8C42)' }}
        />
      </div>
      {showLabel && <span className="text-xs text-slate-500 font-medium w-8">{value}%</span>}
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} animate-slide-up`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-base text-navy-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-5xl mb-4 opacity-60">{icon}</div>}
      <h3 className="font-semibold text-slate-800 text-base mb-1.5">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-5">{description}</p>
      {action}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
}

// ── Stat Card ──────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  change?: number
  icon: ReactNode
  iconBg?: string
}

export function StatCard({ label, value, change, icon, iconBg = 'bg-orange-50' }: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-navy-900 mb-1">{value}</p>
      {change !== undefined && (
        <p className={`text-xs font-medium ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% this month
        </p>
      )}
    </div>
  )
}
