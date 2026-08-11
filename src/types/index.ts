export type PartnerCategory = 'limousine' | 'restaurant' | 'club' | 'bar'
export type PartnerStatus = 'draft' | 'pending' | 'active' | 'suspended' | 'expired' | 'terminated'
export type CodeStatus = 'active' | 'suspended' | 'revoked' | 'expired'
export type UserRole = 'partner_admin' | 'partner_staff' | 'fleet_manager'

export interface Partner {
  id: string
  legalName: string
  tradingName: string
  category: PartnerCategory
  status: PartnerStatus
  municipality: string
  code: string
  scans: number
  downloads: number
  registrations: number
  completedTrips: number
  rewardsIssued: number
  rewardsRedeemed: number
  commissionRate?: number
  contactEmail: string
  contactPhone: string
  branches: number
  agreementExpiry: string
}

export interface PartnerCode {
  id: string
  partnerId: string
  partnerName: string
  alphanumeric: string
  status: CodeStatus
  type: 'primary' | 'sub'
  parentCode?: string
  scans: number
  registrations: number
  rewards: number
  validFrom: string
  validTo: string
  category: PartnerCategory
}

export interface Driver {
  id: string
  name: string
  partnerId: string
  partnerName: string
  nationalId: string
  licenceExpiry: string
  vehicle: string
  plate: string
  status: 'uploaded' | 'registered' | 'active' | 'inactive' | 'suspended' | 'offboarded'
  trips: number
  grossEarnings: number
  commission: number
  netEarnings: number
  registeredAt?: string
}

export interface Voucher {
  id: string
  voucherNumber: string
  userId: string
  userName: string
  partnerId: string
  partnerName: string
  type: 'meal' | 'discount' | 'drink'
  value: string
  tier: 1 | 2 | 3
  status: 'issued' | 'redeemed' | 'expired' | 'voided'
  issuedAt: string
  expiresAt: string
  redeemedAt?: string
}

export interface Settlement {
  id: string
  partnerId: string
  partnerName: string
  category: PartnerCategory
  period: string
  commission: number
  reimbursement: number
  adjustments: number
  netAmount: number
  status: 'draft' | 'pending_approval' | 'approved' | 'paid'
}

export interface FraudAlert {
  id: string
  type: string
  partnerName: string
  severity: 'low' | 'medium' | 'high'
  description: string
  detectedAt: string
  status: 'open' | 'investigating' | 'resolved'
}

export interface DashboardStats {
  totalPartners: number
  activeCodes: number
  totalScans: number
  downloads: number
  registrations: number
  completedTrips: number
  rewardsIssued: number
  rewardsRedeemed: number
  commissionRetained: number
  outstandingLiability: number
}

export interface MilestoneProgress {
  userId: string
  userName: string
  userType: 'rider' | 'driver'
  partnerName: string
  currentTier: 1 | 2 | 3 | 'closed'
  tripsSinceReset: number
  tripsRequired: number
  ladderClosed: boolean
}

import type { IconName } from '../components/icons'

export interface NavItem {
  label: string
  path: string
  icon: IconName
}
