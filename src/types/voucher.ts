export interface VoucherValidationResult {
  valid: boolean
  statusLabel: string
  status: string
  voucherCode: string
  customerName?: string
  rewardLabel?: string
  tierLabel?: string
  expiresAt?: string
  message?: string
}
