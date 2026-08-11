import type { PartnerCode, Settlement } from '../types'

export const codes: PartnerCode[] = [
  {
    id: 'c2',
    partnerId: 'p2',
    partnerName: 'Al Fanar Restaurant',
    alphanumeric: 'QG-RST-9F4KD',
    status: 'active',
    type: 'primary',
    scans: 3420,
    registrations: 1890,
    rewards: 234,
    validFrom: '2025-04-01',
    validTo: '2026-12-31',
    category: 'restaurant',
  },
  {
    id: 'c3',
    partnerId: 'p2',
    partnerName: 'Al Fanar Restaurant',
    alphanumeric: 'QG-RST-9F4KD-BR2',
    status: 'active',
    type: 'sub',
    parentCode: 'QG-RST-9F4KD',
    scans: 890,
    registrations: 420,
    rewards: 56,
    validFrom: '2025-08-01',
    validTo: '2026-12-31',
    category: 'restaurant',
  },
]

export const settlements: Settlement[] = [
  {
    id: 's2',
    partnerId: 'p2',
    partnerName: 'Al Fanar Restaurant',
    category: 'restaurant',
    period: 'July 2026',
    commission: 0,
    reimbursement: 18750,
    adjustments: 0,
    netAmount: -18750,
    status: 'pending_approval',
  },
  {
    id: 's2b',
    partnerId: 'p2',
    partnerName: 'Al Fanar Restaurant',
    category: 'restaurant',
    period: 'June 2026',
    commission: 0,
    reimbursement: 16200,
    adjustments: 0,
    netAmount: -16200,
    status: 'paid',
  },
]

export const partnerStats = {
  scans: 3420,
  downloads: 2100,
  registrations: 1890,
  completedTrips: 4560,
  milestonesAchieved: 234,
  rewardsRedeemed: 187,
  outstandingLiability: 8750,
  redemptionRate: 79.9,
}
