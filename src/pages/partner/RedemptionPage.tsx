import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validatePartnerVoucher } from '../../api/partnerVoucherValidate'
import { Badge, Card, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { clearSession } from '../../lib/authStorage'
import type { VoucherValidationResult } from '../../types/voucher'

type ValidationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; result: VoucherValidationResult }

export function PartnerRedemptionPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [code, setCode] = useState('')
  const [validation, setValidation] = useState<ValidationState>({ status: 'idle' })

  async function validate() {
    if (!session?.access_token) {
      setValidation({ status: 'error', message: 'You must be signed in to validate vouchers.' })
      return
    }

    setValidation({ status: 'loading' })

    try {
      const result = await validatePartnerVoucher(session.access_token, code)

      if (!result.success) {
        if (/token/i.test(result.error)) {
          clearSession()
          navigate('/login')
          return
        }

        setValidation({ status: 'error', message: result.error })
        return
      }

      setValidation({ status: 'done', result: result.data })
    } catch {
      setValidation({
        status: 'error',
        message: 'Unable to validate voucher. Please try again.',
      })
    }
  }

  function handleCodeChange(value: string) {
    setCode(value)
    if (validation.status !== 'idle') {
      setValidation({ status: 'idle' })
    }
  }

  const isLoading = validation.status === 'loading'
  const validationResult = validation.status === 'done' ? validation.result : null

  return (
    <>
      <PageHeader
        title="Redemption Console"
        description="Validate and redeem customer vouchers at your venue"
      />

      <div className="grid-2">
        <Card title="Scan or Enter Voucher">
          <div className="qr-placeholder" style={{ width: 160, height: 160, margin: '0 auto 20px' }}>
            QR scan
          </div>
          <div className="form-group">
            <label htmlFor="voucher">Voucher number</label>
            <input
              id="voucher"
              className="form-input text-mono"
              placeholder="QGV-K7M2NP4X"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => void validate()}
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? 'Validating…' : 'Validate voucher'}
          </button>
        </Card>

        <Card title="Validation Result">
          {validation.status === 'idle' && (
            <div className="empty-state">
              <p>Enter or scan a voucher to validate</p>
            </div>
          )}

          {validation.status === 'loading' && (
            <div className="empty-state">
              <p>Checking voucher…</p>
            </div>
          )}

          {validation.status === 'error' && (
            <div className="empty-state">
              <Badge status="voided" label="Validation failed" />
              <p className="mt-16">{validation.message}</p>
            </div>
          )}

          {validationResult?.valid && (
            <>
              <Badge status={validationResult.status || 'issued'} label={validationResult.statusLabel} />
              <div className="info-list mt-16">
                {validationResult.customerName && (
                  <div className="info-item">
                    <span className="key">Customer</span>
                    <span className="val">{validationResult.customerName}</span>
                  </div>
                )}
                {validationResult.rewardLabel && (
                  <div className="info-item">
                    <span className="key">Reward</span>
                    <span className="val">{validationResult.rewardLabel}</span>
                  </div>
                )}
                {validationResult.tierLabel && (
                  <div className="info-item">
                    <span className="key">Tier</span>
                    <span className="val">{validationResult.tierLabel}</span>
                  </div>
                )}
                {validationResult.expiresAt && (
                  <div className="info-item">
                    <span className="key">Expires</span>
                    <span className="val">{validationResult.expiresAt}</span>
                  </div>
                )}
                {validationResult.voucherCode && (
                  <div className="info-item">
                    <span className="key">Voucher</span>
                    <span className="val">{validationResult.voucherCode}</span>
                  </div>
                )}
              </div>
              <button type="button" className="btn btn-primary mt-16" style={{ width: '100%' }}>
                Redeem now (single-use)
              </button>
            </>
          )}

          {validationResult && !validationResult.valid && (
            <div className="empty-state">
              <Badge status={validationResult.status || 'voided'} label={validationResult.statusLabel} />
              <p className="mt-16">
                {validationResult.message ??
                  'This voucher cannot be redeemed. Contact QGlide support if disputed.'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
