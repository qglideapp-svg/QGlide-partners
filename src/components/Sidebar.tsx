import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import { NavIcon } from './icons'
import type { NavItem } from '../types'

interface SidebarProps {
  brand: string
  subtitle: string
  items: NavItem[]
  footer?: NavItem[]
}

export function Sidebar({ brand, subtitle, items, footer }: SidebarProps) {
  return (
    <aside className="portal-sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="QGlide" className="sidebar-logo" />
        <div className="sidebar-brand-text">
          <span className="sidebar-eyebrow">{subtitle}</span>
          <span className="sidebar-title">{brand}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
            end={item.path.split('/').length <= 3}
          >
            <span className="sidebar-link-icon">
              <NavIcon name={item.icon} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      {footer && footer.length > 0 && (
        <div className="sidebar-footer">
          {footer.map((item) => (
            <NavLink key={item.path} to={item.path} className="sidebar-link sidebar-link--muted">
              <span className="sidebar-link-icon">
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </aside>
  )
}
