import { partnerStats } from '../../data/mockData'
import { Card, formatCurrency, formatNumber, PageHeader, StatCard } from '../../components/ui'

export function PartnerDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Partner Portal"
        title="Dashboard"
        description="Your code performance — scans, registrations, milestones and redemptions"
      />

      <div className="stat-grid">
        <StatCard label="Scans" value={formatNumber(partnerStats.scans)} />
        <StatCard label="Downloads" value={formatNumber(partnerStats.downloads)} highlight />
        <StatCard label="Registrations" value={formatNumber(partnerStats.registrations)} />
        <StatCard label="Completed Trips" value={formatNumber(partnerStats.completedTrips)} />
        <StatCard label="Milestones Achieved" value={formatNumber(partnerStats.milestonesAchieved)} />
        <StatCard label="Rewards Redeemed" value={formatNumber(partnerStats.rewardsRedeemed)} sub={`${partnerStats.redemptionRate}% rate`} />
        <StatCard label="Outstanding Liability" value={formatCurrency(partnerStats.outstandingLiability)} />
      </div>

      <div className="funnel-steps">
        {[
          { name: 'Scans', count: partnerStats.scans },
          { name: 'Downloads', count: partnerStats.downloads },
          { name: 'Registrations', count: partnerStats.registrations },
          { name: 'Trips', count: partnerStats.completedTrips },
          { name: 'Milestones', count: partnerStats.milestonesAchieved },
          { name: 'Redeemed', count: partnerStats.rewardsRedeemed },
        ].map((s) => (
          <div key={s.name} className="funnel-step">
            <div className="count">{formatNumber(s.count)}</div>
            <div className="name">{s.name}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <Card title="Reward Ladder Progress">
          <p className="text-muted mb-16">
            Your customers earn rewards at 3, 9 and 15 completed trips (riders). Counter resets after each redemption.
          </p>
          <div className="metric-row">
            <span>Tier 1 rewards issued</span><strong>156</strong>
          </div>
          <div className="metric-row">
            <span>Tier 2 rewards issued</span><strong>52</strong>
          </div>
          <div className="metric-row">
            <span>Tier 3 rewards issued</span><strong>26</strong>
          </div>
          <div className="metric-row">
            <span>Ladders closed</span><strong>18 users</strong>
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="metric-row">
            <div>
              <strong>Milestone reached</strong>
              <div className="text-muted">Sara Al-Kuwari — Tier 1 meal</div>
            </div>
            <span className="text-muted">2h ago</span>
          </div>
          <div className="metric-row">
            <div>
              <strong>Voucher redeemed</strong>
              <div className="text-muted">QGV-2026-00865 at your venue</div>
            </div>
            <span className="text-muted">5h ago</span>
          </div>
          <div className="metric-row">
            <div>
              <strong>New registration</strong>
              <div className="text-muted">Via sub-code BR2</div>
            </div>
            <span className="text-muted">Yesterday</span>
          </div>
        </Card>
      </div>
    </>
  )
}
