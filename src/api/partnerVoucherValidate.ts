import { partnerPost } from './client'
import type { VoucherValidationResult } from '../types/voucher'

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
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

function isTruthyFlag(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === 'valid' || normalized === 'issued'
  }
  return false
}

function statusFromPayload(data: Record<string, unknown>): { valid: boolean; status: string; statusLabel: string } {
  const status = String(
    data.status ?? data.voucher_status ?? data.validation_status ?? (isTruthyFlag(data.valid) ? 'issued' : 'voided'),
  )
    .trim()
    .toLowerCase()

  const valid =
    isTruthyFlag(data.valid) ||
    isTruthyFlag(data.is_valid) ||
    ['issued', 'valid', 'active', 'ready'].includes(status)

  const statusLabel =
    toOptionalString(data.status_label ?? data.statusLabel ?? data.validation_status_label) ??
    (valid ? 'Valid — ready to redeem' : 'Invalid or expired')

  return { valid, status, statusLabel }
}

function normalizeValidation(raw: unknown, voucherCode: string): VoucherValidationResult {
  const payload = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const data = pickRecord(payload, ['voucher', 'validation', 'result', 'data'])
  const merged = { ...payload, ...data }
  const { valid, status, statusLabel } = statusFromPayload(merged)

  const tierValue = merged.tier ?? merged.tier_number ?? merged.reward_tier
  const tierLabel =
    toOptionalString(merged.tier_label ?? merged.tierLabel) ??
    (tierValue !== undefined && tierValue !== null && String(tierValue).trim()
      ? `Tier ${String(tierValue).replace(/^tier\s*/i, '')}`
      : undefined)

  return {
    valid,
    status,
    statusLabel,
    voucherCode: toOptionalString(merged.voucher_code ?? merged.voucherCode ?? merged.code) ?? voucherCode,
    customerName: toOptionalString(
      merged.customer_name ?? merged.customerName ?? merged.user_name ?? merged.userName ?? merged.customer,
    ),
    rewardLabel: toOptionalString(
      merged.reward ??
        merged.reward_label ??
        merged.rewardLabel ??
        merged.value ??
        merged.reward_value ??
        merged.rewardValue,
    ),
    tierLabel,
    expiresAt: toOptionalString(
      merged.expires_at ?? merged.expiresAt ?? merged.expiry ?? merged.expires ?? merged.valid_until,
    ),
    message: toOptionalString(merged.message ?? merged.detail ?? merged.reason),
  }
}

export async function validatePartnerVoucher(
  accessToken: string,
  voucherCode: string,
): Promise<{ success: true; data: VoucherValidationResult } | { success: false; error: string }> {
  const trimmedCode = voucherCode.trim()
  if (!trimmedCode) {
    return { success: false, error: 'Enter a voucher number to validate.' }
  }

  const result = await partnerPost<unknown>('partner-voucher-validate', accessToken, {
    voucher_code: trimmedCode,
  })

  if (!result.success) {
    return result
  }

  const validation = normalizeValidation(result.data, trimmedCode)

  if (!validation.valid) {
    return {
      success: true,
      data: {
        ...validation,
        message: validation.message ?? 'This voucher cannot be redeemed.',
      },
    }
  }

  return {
    success: true,
    data: validation,
  }
}
