import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from './components/RequireAuth'
import { PartnerLayout } from './layouts/PortalLayouts'
import { LoginPage } from './pages/LoginPage'
import { PartnerDriversPage } from './pages/partner/DriversPage'
import { PartnerRedemptionPage } from './pages/partner/RedemptionPage'
import { PartnerStatementsPage } from './pages/partner/StatementsPage'
import { PartnerDocumentsPage } from './pages/partner/DocumentsPage'
import { PartnerSupportPage } from './pages/partner/SupportPage'
import { PartnerUsersPage } from './pages/partner/UsersPage'
import { ScanLandingPage } from './pages/public/ScanLandingPage'
import { ClaimLandingPage } from './pages/public/ClaimLandingPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/partner',
        element: <PartnerLayout />,
        children: [
          {
            index: true,
            lazy: () => import('./pages/partner/DashboardPage'),
          },
          {
            path: 'codes',
            lazy: () => import('./pages/partner/CodesPage'),
          },
          { path: 'drivers', element: <PartnerDriversPage /> },
          {
            path: 'earnings',
            lazy: () => import('./pages/partner/EarningsPage'),
          },
          { path: 'redemption', element: <PartnerRedemptionPage /> },
          { path: 'statements', element: <PartnerStatementsPage /> },
          { path: 'documents', element: <PartnerDocumentsPage /> },
          { path: 'support', element: <PartnerSupportPage /> },
          { path: 'users', element: <PartnerUsersPage /> },
        ],
      },
    ],
  },
  { path: '/scan/:code?', element: <ScanLandingPage /> },
  { path: '/claim/:id?', element: <ClaimLandingPage /> },
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
])
