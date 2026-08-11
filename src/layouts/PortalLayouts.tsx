import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import type { NavItem } from '../types'

const partnerNav: NavItem[] = [
  { label: 'Dashboard', path: '/partner', icon: 'dashboard' },
  { label: 'Code Centre', path: '/partner/codes', icon: 'codes' },
  { label: 'Drivers', path: '/partner/drivers', icon: 'drivers' },
  { label: 'Earnings', path: '/partner/earnings', icon: 'settlements' },
  { label: 'Redemption', path: '/partner/redemption', icon: 'rewards' },
  { label: 'Statements', path: '/partner/statements', icon: 'reports' },
  { label: 'Documents', path: '/partner/documents', icon: 'documents' },
  { label: 'Support', path: '/partner/support', icon: 'support' },
  { label: 'Users', path: '/partner/users', icon: 'users' },
]

const partnerFooter: NavItem[] = [
  { label: 'Sign out', path: '/login', icon: 'logout' },
]

export function PartnerLayout() {
  return (
    <div className="portal-layout">
      <Sidebar
        brand="Al Fanar Restaurant"
        subtitle="Partner Portal"
        items={partnerNav}
        footer={partnerFooter}
      />
      <div className="portal-main">
        <header className="portal-topbar">
          <div className="topbar-left">
            <span className="topbar-eyebrow">Restaurant Partner</span>
            <span className="topbar-title">Self-Service Portal</span>
          </div>
          <div className="topbar-user">
            <div className="topbar-user-meta">
              <span className="topbar-user-name">Partner Administrator</span>
              <span className="topbar-user-role">Souq Waqif, Doha</span>
            </div>
            <div className="user-avatar">PA</div>
          </div>
        </header>
        <main className="portal-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
