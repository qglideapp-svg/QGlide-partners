import { useState } from 'react'
import { Badge, Card, PageHeader } from '../../components/ui'

export function PartnerRedemptionPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<'idle' | 'valid' | 'invalid'>('idle')

  function validate() {
    setResult(code.toUpperCase().startsWith('QGV') ? 'valid' : 'invalid')
  }

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
              placeholder="QGV-2026-00891"
              value={code}
              onChange={(e) => { setCode(e.target.value); setResult('idle') }}
            />
          </div>
          <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={validate}>
            Validate voucher
          </button>
        </Card>

        <Card title="Validation Result">
          {result === 'idle' && (
            <div className="empty-state">
              <p>Enter or scan a voucher to validate</p>
            </div>
          )}
          {result === 'valid' && (
            <>
              <Badge status="issued" label="Valid — ready to redeem" />
              <div className="info-list mt-16">
                <div className="info-item"><span className="key">Customer</span><span className="val">Sara Al-Kuwari</span></div>
                <div className="info-item"><span className="key">Reward</span><span className="val">QAR 75 meal credit</span></div>
                <div className="info-item"><span className="key">Tier</span><span className="val">Tier 1</span></div>
                <div className="info-item"><span className="key">Expires</span><span className="val">2026-09-05</span></div>
              </div>
              <button type="button" className="btn btn-primary mt-16" style={{ width: '100%' }}>
                Redeem now (single-use)
              </button>
            </>
          )}
          {result === 'invalid' && (
            <div className="empty-state">
              <Badge status="voided" label="Invalid or expired" />
              <p className="mt-16">This voucher cannot be redeemed. Contact QGlide support if disputed.</p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
