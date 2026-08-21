import { Form, useLoaderData, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'
import { EarningsSkeleton } from '../../components/skeletons/PartnerPageSkeletons'
import { fetchPartnerSettlements } from '../../api/partnerSettlements'
import { Badge, Card, formatCurrency, PageHeader, StatCard } from '../../components/ui'
import { handlePartnerApiFailure, requirePartnerSession } from '../../lib/partnerLoader'
import type { PartnerSettlementsData } from '../../types/settlements'

function settlementStatusVariant(status: string | null): string {
  return status ?? 'draft'
}

export async function loader({ request }: LoaderFunctionArgs): Promise<PartnerSettlementsData> {
  const session = requirePartnerSession()
  const url = new URL(request.url)
  const now = new Date()
  const periodStart = url.searchParams.get('period_start')?.trim()
  const periodEnd = url.searchParams.get('period_end')?.trim()
  const settlementsLimit = Number(url.searchParams.get('settlements_limit') ?? '12')

  const query =
    periodStart && periodEnd
      ? {
          period_start: periodStart,
          period_end: periodEnd,
          settlements_limit: settlementsLimit,
        }
      : {
          year: Number(url.searchParams.get('year') ?? now.getFullYear()),
          month: Number(url.searchParams.get('month') ?? now.getMonth() + 1),
          settlements_limit: settlementsLimit,
        }

  const result = await fetchPartnerSettlements(session.access_token, query)

  if (!result.success) {
    handlePartnerApiFailure(result.error)
  }

  return result.data
}

export function HydrateFallback() {
  return <EarningsSkeleton />
}

export function Component() {
  const earnings = useLoaderData() as PartnerSettlementsData
  const navigate = useNavigate()
  const { period, netPosition, mealPaymentAgreement, outstandingLiability, settlements } =
    earnings

  const currentYear = Number(period.start.slice(0, 4)) || new Date().getFullYear()
  const currentMonth = Number(period.start.slice(5, 7)) || new Date().getMonth() + 1

  return (
    <>
      <PageHeader
        title="Earnings & Settlement"
        description="Reward reimbursement position and period statements"
        actions={
          <Form
            method="get"
            className="earnings-period-form"
            onChange={(event) => {
              const form = event.currentTarget
              const formData = new FormData(form)
              const params = new URLSearchParams()

              const year = String(formData.get('year') ?? '')
              const month = String(formData.get('month') ?? '')

              if (year) params.set('year', year)
              if (month) params.set('month', month)

              navigate(`/partner/earnings?${params.toString()}`)
            }}
          >
            <label htmlFor="earnings-month" className="sr-only">
              Statement month
            </label>
            <select id="earnings-month" name="month" defaultValue={String(currentMonth)} className="form-input">
              {Array.from({ length: 12 }, (_, index) => {
                const month = index + 1
                return (
                  <option key={month} value={month}>
                    {new Date(currentYear, index, 1).toLocaleString('en', { month: 'long' })}
                  </option>
                )
              })}
            </select>
            <label htmlFor="earnings-year" className="sr-only">
              Statement year
            </label>
            <select id="earnings-year" name="year" defaultValue={String(currentYear)} className="form-input">
              {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </Form>
        }
      />

      <div className="stat-grid">
        <StatCard
          label={`${period.label} Net Position`}
          value={formatCurrency(Math.abs(netPosition.netQar))}
          sub={netPosition.description}
          highlight
        />
        <StatCard
          label="Reimbursement"
          value={formatCurrency(netPosition.reimbursementQar)}
        />
        <div className="stat-card">
          <div className="label">Status</div>
          <div className="value" style={{ fontSize: '1rem' }}>
            <Badge
              status={settlementStatusVariant(netPosition.status)}
              label={netPosition.statusLabel}
            />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <Card title="Meal Payment Agreement">
          <div className="info-list">
            <div className="info-item">
              <span className="key">Reward type</span>
              <span className="val">{mealPaymentAgreement.rewardTypeLabel}</span>
            </div>
            <div className="info-item">
              <span className="key">Funding split</span>
              <span className="val">{mealPaymentAgreement.fundingSplitLabel}</span>
            </div>
            <div className="info-item">
              <span className="key">Settlement cycle</span>
              <span className="val">{mealPaymentAgreement.settlementCycleLabel}</span>
            </div>
            <div className="info-item">
              <span className="key">Redemptions ({period.label})</span>
              <span className="val">
                {mealPaymentAgreement.redemptionsCount.toLocaleString()} meals
              </span>
            </div>
          </div>
        </Card>

        <Card title="Outstanding Liability">
          <p className="text-muted">{outstandingLiability.description}</p>
          <div className="stat-value-lg">
            {formatCurrency(outstandingLiability.unredeemedVoucherValueQar)}
          </div>
          <p className="text-muted">
            {outstandingLiability.activeVoucherCount.toLocaleString()} active vouchers awaiting
            redemption
          </p>
        </Card>
      </div>

      {settlements.length > 0 && (
        <Card title="Recent Settlement History">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Net amount</th>
                  <th>Reimbursement</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.periodLabel}</strong>
                    </td>
                    <td>{formatCurrency(Math.abs(item.netQar))}</td>
                    <td>{formatCurrency(item.reimbursementQar)}</td>
                    <td>
                      <Badge
                        status={settlementStatusVariant(item.status)}
                        label={item.statusLabel}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
