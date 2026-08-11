import { settlements } from '../../data/mockData'
import { Badge, Card, formatCurrency, PageHeader } from '../../components/ui'

const partnerSettlement = settlements.find((s) => s.partnerId === 'p2')

export function PartnerEarningsPage() {
  return (
    <>
      <PageHeader
        title="Earnings & Settlement"
        description="Reward reimbursement position and period statements"
      />

      {partnerSettlement && (
        <div className="stat-grid">
          <div className="stat-card highlight">
            <div className="label">July 2026 Net Position</div>
            <div className="value">{formatCurrency(Math.abs(partnerSettlement.netAmount))}</div>
            <div className="sub">Payable to partner (meal reimbursement)</div>
          </div>
          <div className="stat-card">
            <div className="label">Reimbursement</div>
            <div className="value">{formatCurrency(partnerSettlement.reimbursement)}</div>
          </div>
            <div className="stat-card">
            <div className="label">Status</div>
            <div className="value" style={{ fontSize: '1rem' }}><Badge status={partnerSettlement.status} /></div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <Card title="Meal Payment Agreement">
          <div className="info-list">
            <div className="info-item"><span className="key">Reward type</span><span className="val">QAR 75 meal credit</span></div>
            <div className="info-item"><span className="key">Funding split</span><span className="val">60% QGlide / 40% Restaurant</span></div>
            <div className="info-item"><span className="key">Settlement cycle</span><span className="val">Monthly</span></div>
            <div className="info-item"><span className="key">Redemptions (July)</span><span className="val">187 meals</span></div>
          </div>
        </Card>

        <Card title="Outstanding Liability">
          <p className="text-muted">Issued but unredeemed voucher value</p>
          <div className="stat-value-lg">
            {formatCurrency(8750)}
          </div>
          <p className="text-muted">47 active vouchers awaiting redemption</p>
        </Card>
      </div>
    </>
  )
}
