import { partnerDownload, partnerGet } from './client'
import type { PartnerStatementsData, StatementArchiveItem } from '../types/statements'
import { triggerBrowserDownload } from '../utils/downloadBlob'

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function formatNetAmountLabel(netQar: number, rawLabel?: unknown): string {
  const label = toOptionalString(rawLabel)
  if (label) return label
  return `QAR ${netQar.toLocaleString('en-QA')}`
}

function normalizeStatement(raw: unknown, index: number): StatementArchiveItem {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const netQar = toNumber(item.net_qar ?? item.netQar ?? item.net_amount)

  return {
    id: String(item.id ?? item.settlement_id ?? `statement-${index}`),
    periodLabel: String(item.period_label ?? item.periodLabel ?? item.period ?? 'Unknown period'),
    periodStart: String(item.period_start ?? item.periodStart ?? ''),
    periodEnd: String(item.period_end ?? item.periodEnd ?? ''),
    netQar,
    netAmountLabel: formatNetAmountLabel(netQar, item.net_amount_label ?? item.netAmountLabel),
    generatedAt: String(item.generated_at ?? item.generatedAt ?? item.created_at ?? ''),
    status: String(item.status ?? 'pending_approval'),
    statusLabel: String(item.status_label ?? item.statusLabel ?? item.status ?? 'Pending'),
    redemptionsCount: toNumber(item.redemptions_count ?? item.redemptionsCount),
  }
}

function normalizeStatementsList(raw: unknown): PartnerStatementsData {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const statements = Array.isArray(data.statements) ? data.statements : []

  return {
    statements: statements.map(normalizeStatement),
    totalCount: toNumber(data.total_count ?? data.totalCount ?? statements.length),
  }
}

export async function fetchPartnerStatements(
  accessToken: string,
  limit = 24,
): Promise<{ success: true; data: PartnerStatementsData } | { success: false; error: string }> {
  const result = await partnerGet<unknown>('partner-statements', accessToken, { limit })

  if (!result.success) {
    return result
  }

  return {
    success: true,
    data: normalizeStatementsList(result.data),
  }
}

export async function downloadPartnerStatement(
  accessToken: string,
  settlementId: string,
  format: 'pdf' | 'xlsx',
): Promise<{ success: true } | { success: false; error: string }> {
  const trimmedId = settlementId.trim()
  if (!trimmedId) {
    return { success: false, error: 'Statement ID is required.' }
  }

  const result = await partnerDownload(
    'partner-statements',
    accessToken,
    {
      settlement_id: trimmedId,
      format,
    },
    format === 'pdf' ? 'statement.pdf' : 'statement.xlsx',
  )

  if (!result.success) {
    return result
  }

  triggerBrowserDownload(result.blob, result.filename)
  return { success: true }
}
