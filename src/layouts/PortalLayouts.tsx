import { Outlet, useNavigate, useNavigation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { PageLoader } from '../components/PageLoader'
import { useAuth } from '../context/AuthContext'
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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function formatCategory(category: string): string {
  return `${category.charAt(0).toUpperCase()}${category.slice(1)} Partner`
}

export function PartnerLayout() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { session, logout } = useAuth()
  const partner = session?.partner
  const user = session?.user
  const isLoading = navigation.state === 'loading'

  const partnerFooter: NavItem[] = [
    {
      label: 'Sign out',
      path: '/login',
      icon: 'logout',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <div className="portal-layout">
      <Sidebar
        brand={partner?.trading_name ?? 'Partner'}
        subtitle="Partner Portal"
        items={partnerNav}
        footer={partnerFooter}
      />
      <div className="portal-main">
        <header className="portal-topbar">
          <div className="topbar-left">
            <span className="topbar-eyebrow">
              {partner ? formatCategory(partner.category) : 'Partner'}
            </span>
            <span className="topbar-title">Self-Service Portal</span>
          </div>
          <div className="topbar-user">
            <div className="topbar-user-meta">
              <span className="topbar-user-name">{user?.full_name ?? 'Partner User'}</span>
              <span className="topbar-user-role">{user?.email ?? ''}</span>
            </div>
            <div className="user-avatar">{initials(user?.full_name ?? 'PU')}</div>
          </div>
        </header>
        <main className="portal-content">
          {isLoading ? <PageLoader /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
