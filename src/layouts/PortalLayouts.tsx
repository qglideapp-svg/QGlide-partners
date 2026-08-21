import { Outlet, useNavigate, useNavigation } from 'react-router-dom'
import { PartnerRouteSkeleton } from '../components/skeletons/PartnerPageSkeletons'
import { Sidebar } from '../components/Sidebar'
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
  // User management hidden until partner-users API is available
  // { label: 'Users', path: '/partner/users', icon: 'users' },
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
  const pendingPath = navigation.location?.pathname ?? ''

  const partnerFooter: NavItem[] = [
    {
      label: 'Sign out',
      path: '/login',
      icon: 'logout',
      onClick: () => {
        void logout().then(() => navigate('/login'))
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
        pendingPath={isLoading ? pendingPath : undefined}
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
        <main className="portal-content" aria-busy={isLoading}>
          {isLoading ? <PartnerRouteSkeleton pathname={pendingPath} /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
