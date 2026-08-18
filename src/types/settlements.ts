export interface SettlementPartner {
  id: string
  legalName: string
  tradingName: string
  category: string
  status: string
}

export interface SettlementPeriod {
  start: string
  end: string
  label: string
}

export interface NetPosition {
  netQar: number
  reimbursementQar: number
  commissionQar: number
  adjustmentsQar: number
  status: string | null
  statusLabel: string
  description: string
  settlementId: string | null
  source: string
}

export interface MealPaymentAgreement {
  rewardType: string | null
  rewardTypeLabel: string
  fundingSplitLabel: string
  qglideContributionPct: number
  partnerContributionPct: number
  settlementCycle: string
  settlementCycleLabel: string
  redemptionsCount: number
}

export interface OutstandingLiability {
  unredeemedVoucherValueQar: number
  activeVoucherCount: number
  description: string
}

export interface SettlementHistoryItem {
  id: string
  periodLabel: string
  netQar: number
  reimbursementQar: number
  commissionQar: number
  adjustmentsQar: number
  status: string | null
  statusLabel: string
  generatedAt?: string
}

export interface PartnerSettlementsData {
  partner: SettlementPartner
  period: SettlementPeriod
  netPosition: NetPosition
  mealPaymentAgreement: MealPaymentAgreement
  outstandingLiability: OutstandingLiability
  settlements: SettlementHistoryItem[]
}

export interface PartnerSettlementsQuery {
  year?: number
  month?: number
  period_start?: string
  period_end?: string
  settlements_limit?: number
}
