import type { ReactNode } from 'react'

interface BadgeProps {
  status: string
  label?: string
}

const statusMap: Record<string, string> = {
  active: 'success',
  complete: 'success',
  pending: 'warning',
  draft: 'neutral',
  suspended: 'danger',
  expired: 'neutral',
  terminated: 'danger',
  issued: 'info',
  redeemed: 'success',
  voided: 'danger',
  open: 'danger',
  investigating: 'warning',
  resolved: 'success',
  approved: 'success',
  paid: 'success',
  pending_approval: 'warning',
  registered: 'info',
  uploaded: 'neutral',
  inactive: 'neutral',
  offboarded: 'neutral',
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
}

export function Badge({ status, label }: BadgeProps) {
  const variant = statusMap[status] ?? 'neutral'
  const text = label ?? status.replace(/_/g, ' ')
  return <span className={`badge ${variant}`}>{text}</span>
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}

export function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <div className={`stat-card${highlight ? ' highlight' : ''}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  )
}

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-row">
        <div>
          {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {description && <p className="page-desc">{description}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  )
}

interface CardProps {
  title?: string
  action?: ReactNode
  children: ReactNode
}

export function Card({ title, action, children }: CardProps) {
  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  )
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-QA')
}

export function formatCurrency(n: number): string {
  return `QAR ${n.toLocaleString('en-QA')}`
}
