import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PartnerLayout } from './layouts/PortalLayouts'
import { LoginPage } from './pages/LoginPage'

import { PartnerDashboardPage } from './pages/partner/DashboardPage'
import { PartnerCodesPage } from './pages/partner/CodesPage'
import { PartnerDriversPage } from './pages/partner/DriversPage'
import { PartnerEarningsPage } from './pages/partner/EarningsPage'
import { PartnerRedemptionPage } from './pages/partner/RedemptionPage'
import { PartnerStatementsPage } from './pages/partner/StatementsPage'
import { PartnerDocumentsPage } from './pages/partner/DocumentsPage'
import { PartnerSupportPage } from './pages/partner/SupportPage'
import { PartnerUsersPage } from './pages/partner/UsersPage'

import { ScanLandingPage } from './pages/public/ScanLandingPage'
import { ClaimLandingPage } from './pages/public/ClaimLandingPage'

import './styles/portal.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/partner" element={<PartnerLayout />}>
          <Route index element={<PartnerDashboardPage />} />
          <Route path="codes" element={<PartnerCodesPage />} />
          <Route path="drivers" element={<PartnerDriversPage />} />
          <Route path="earnings" element={<PartnerEarningsPage />} />
          <Route path="redemption" element={<PartnerRedemptionPage />} />
          <Route path="statements" element={<PartnerStatementsPage />} />
          <Route path="documents" element={<PartnerDocumentsPage />} />
          <Route path="support" element={<PartnerSupportPage />} />
          <Route path="users" element={<PartnerUsersPage />} />
        </Route>

        <Route path="/scan/:code?" element={<ScanLandingPage />} />
        <Route path="/claim/:id?" element={<ClaimLandingPage />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
