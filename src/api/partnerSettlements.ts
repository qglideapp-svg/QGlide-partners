import { partnerGet } from './client'
import type {
  MealPaymentAgreement,
  NetPosition,
  OutstandingLiability,
  PartnerSettlementsData,
  PartnerSettlementsQuery,
  SettlementHistoryItem,
  SettlementPartner,
  SettlementPeriod,
} from '../types/settlements'

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  return str ? str : null
}

function pickRecord(source: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  for (const key of keys) {
    const value = source[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
  }
  return source
}

function normalizePartner(raw: Record<string, unknown>): SettlementPartner {
  const source = pickRecord(raw, ['partner'])

  return {
    id: String(source.id ?? ''),
    legalName: String(source.legal_name ?? source.legalName ?? ''),
    tradingName: String(source.trading_name ?? source.tradingName ?? ''),
    category: String(source.category ?? ''),
    status: String(source.status ?? 'active'),
  }
}

function normalizePeriod(raw: Record<string, unknown>): SettlementPeriod {
  const source = pickRecord(raw, ['period'])

  return {
    start: String(source.start ?? source.period_start ?? ''),
    end: String(source.end ?? source.period_end ?? ''),
    label: String(source.label ?? source.name ?? 'Current period'),
  }
}

function normalizeNetPosition(raw: Record<string, unknown>): NetPosition {
  const source = pickRecord(raw, ['net_position', 'netPosition'])

  return {
    netQar: toNumber(source.net_qar ?? source.netQar ?? source.net_amount),
    reimbursementQar: toNumber(source.reimbursement_qar ?? source.reimbursement),
    commissionQar: toNumber(source.commission_qar ?? source.commission),
    adjustmentsQar: toNumber(source.adjustments_qar ?? source.adjustments),
    status: toNullableString(source.status),
    statusLabel: String(source.status_label ?? source.statusLabel ?? 'Unknown'),
    description: String(
      source.description ?? 'Payable to partner (meal reimbursement)',
    ),
    settlementId: toNullableString(source.settlement_id ?? source.settlementId),
    source: String(source.source ?? 'settlement'),
  }
}

function normalizeMealPaymentAgreement(raw: Record<string, unknown>): MealPaymentAgreement {
  const source = pickRecord(raw, ['meal_payment_agreement', 'mealPaymentAgreement'])
  const fundingSplit = pickRecord(source, ['funding_split', 'fundingSplit'])

  return {
    rewardType: toNullableString(source.reward_type ?? source.rewardType),
    rewardTypeLabel: String(source.reward_type_label ?? source.rewardTypeLabel ?? '—'),
    fundingSplitLabel: String(
      fundingSplit.label ??
        `${toNumber(fundingSplit.qglide_contribution_pct)}% QGlide / ${toNumber(fundingSplit.partner_contribution_pct)}% Restaurant`,
    ),
    qglideContributionPct: toNumber(
      fundingSplit.qglide_contribution_pct ?? fundingSplit.qglideContributionPct,
    ),
    partnerContributionPct: toNumber(
      fundingSplit.partner_contribution_pct ?? fundingSplit.partnerContributionPct,
    ),
    settlementCycle: String(source.settlement_cycle ?? source.settlementCycle ?? 'monthly'),
    settlementCycleLabel: String(
      source.settlement_cycle_label ?? source.settlementCycleLabel ?? 'Monthly',
    ),
    redemptionsCount: toNumber(source.redemptions_count ?? source.redemptionsCount),
  }
}

function normalizeOutstandingLiability(raw: Record<string, unknown>): OutstandingLiability {
  const source = pickRecord(raw, ['outstanding_liability', 'outstandingLiability'])

  return {
    unredeemedVoucherValueQar: toNumber(
      source.unredeemed_voucher_value_qar ??
        source.unredeemedVoucherValueQar ??
        source.amount,
    ),
    activeVoucherCount: toNumber(
      source.active_voucher_count ?? source.activeVoucherCount ?? source.count,
    ),
    description: String(
      source.description ?? 'Issued but unredeemed voucher value',
    ),
  }
}

function normalizeSettlementHistoryItem(raw: unknown, index: number): SettlementHistoryItem {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>

  return {
    id: String(item.id ?? item.settlement_id ?? `settlement-${index}`),
    periodLabel: String(
      item.period_label ?? item.period ?? item.label ?? `Period ${index + 1}`,
    ),
    netQar: toNumber(item.net_qar ?? item.netQar ?? item.net_amount),
    reimbursementQar: toNumber(item.reimbursement_qar ?? item.reimbursement),
    commissionQar: toNumber(item.commission_qar ?? item.commission),
    adjustmentsQar: toNumber(item.adjustments_qar ?? item.adjustments),
    status: toNullableString(item.status),
    statusLabel: String(item.status_label ?? item.statusLabel ?? item.status ?? 'Unknown'),
    generatedAt: toOptionalString(
      item.generated_at ?? item.generatedAt ?? item.created_at ?? item.date,
    ),
  }
}

function normalizeSettlements(raw: unknown): PartnerSettlementsData {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const settlementsSource = Array.isArray(data.settlements) ? data.settlements : []

  return {
    partner: normalizePartner(data),
    period: normalizePeriod(data),
    netPosition: normalizeNetPosition(data),
    mealPaymentAgreement: normalizeMealPaymentAgreement(data),
    outstandingLiability: normalizeOutstandingLiability(data),
    settlements: settlementsSource.map(normalizeSettlementHistoryItem),
  }
}

export async function fetchPartnerSettlements(
  accessToken: string,
  query: PartnerSettlementsQuery = {},
): Promise<{ success: true; data: PartnerSettlementsData } | { success: false; error: string }> {
  const searchParams: Record<string, string | number | undefined> = {}

  if (query.period_start && query.period_end) {
    searchParams.period_start = query.period_start
    searchParams.period_end = query.period_end
  } else {
    if (query.year !== undefined) searchParams.year = query.year
    if (query.month !== undefined) searchParams.month = query.month
  }

  if (query.settlements_limit !== undefined) {
    searchParams.settlements_limit = query.settlements_limit
  }

  const result = await partnerGet<unknown>('partner-settlements', accessToken, searchParams)

  if (!result.success) {
    return result
  }

  return {
    success: true,
    data: normalizeSettlements(result.data),
  }
}
