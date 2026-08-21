import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppProviders } from './AppProviders'
import { PartnerPageError } from './components/PartnerPageError'
import { RequireAuth } from './components/RequireAuth'
import { PartnerLayout } from './layouts/PortalLayouts'
import { LoginPage } from './pages/LoginPage'
import { PartnerRedemptionPage } from './pages/partner/RedemptionPage'
// import { PartnerUsersPage } from './pages/partner/UsersPage'
import { ScanLandingPage } from './pages/public/ScanLandingPage'
import { ClaimLandingPage } from './pages/public/ClaimLandingPage'

export const router = createBrowserRouter([
  {
    element: <AppProviders />,
    children: [
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
                lazy: async () => import('./pages/partner/DashboardPage'),
              },
              {
                path: 'codes',
                lazy: async () => import('./pages/partner/CodesPage'),
              },
              {
                path: 'drivers',
                lazy: async () => {
                  const module = await import('./pages/partner/DriversPage')
                  return {
                    ...module,
                    errorElement: <PartnerPageError />,
                  }
                },
              },
              {
                path: 'earnings',
                lazy: async () => import('./pages/partner/EarningsPage'),
              },
              { path: 'redemption', element: <PartnerRedemptionPage /> },
              {
                path: 'statements',
                lazy: async () => {
                  const module = await import('./pages/partner/StatementsPage')
                  return {
                    ...module,
                    errorElement: <PartnerPageError />,
                  }
                },
              },
              {
                path: 'documents',
                lazy: async () => {
                  const module = await import('./pages/partner/DocumentsPage')
                  return {
                    ...module,
                    errorElement: <PartnerPageError />,
                  }
                },
              },
              {
                path: 'support',
                lazy: async () => {
                  const module = await import('./pages/partner/SupportPage')
                  return {
                    ...module,
                    errorElement: <PartnerPageError />,
                  }
                },
              },
              // User management hidden until partner-users API is available
              // { path: 'users', element: <PartnerUsersPage /> },
            ],
          },
        ],
      },
      { path: '/scan/:code?', element: <ScanLandingPage /> },
      { path: '/claim/:id?', element: <ClaimLandingPage /> },
      { path: '/', element: <Navigate to="/login" replace /> },
      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
])
