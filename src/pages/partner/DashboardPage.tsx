import { useLoaderData, type LoaderFunctionArgs } from 'react-router-dom'
import { fetchPartnerDashboard } from '../../api/partnerDashboard'
import { Card, formatCurrency, formatNumber, PageHeader, StatCard } from '../../components/ui'
import { PageLoader } from '../../components/PageLoader'
import { handlePartnerApiFailure, requirePartnerSession } from '../../lib/partnerLoader'
import type { PartnerDashboardData } from '../../types/dashboard'
import { formatRelativeTime } from '../../utils/formatRelativeTime'

export async function loader({ request }: LoaderFunctionArgs): Promise<PartnerDashboardData> {
  const session = requirePartnerSession()
  const url = new URL(request.url)
  const activityLimit = Number(url.searchParams.get('activity_limit') ?? '10')
  const result = await fetchPartnerDashboard(session.access_token, activityLimit)

  if (!result.success) {
    handlePartnerApiFailure(result.error)
  }

  return result.data
}

export function HydrateFallback() {
  return <PageLoader label="Loading dashboard…" />
}

export function Component() {
  const dashboard = useLoaderData() as PartnerDashboardData
  const { stats, rewardLadder, recentActivity } = dashboard

  const funnelSteps = [
    { name: 'Scans', count: stats.scans },
    { name: 'Downloads', count: stats.downloads },
    { name: 'Registrations', count: stats.registrations },
    { name: 'Trips', count: stats.completedTrips },
    { name: 'Milestones', count: stats.milestonesAchieved },
    { name: 'Redeemed', count: stats.rewardsRedeemed },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Partner Portal"
        title="Dashboard"
        description="Your code performance — scans, registrations, milestones and redemptions"
      />

      <div className="stat-grid">
        <StatCard label="Scans" value={formatNumber(stats.scans)} />
        <StatCard label="Downloads" value={formatNumber(stats.downloads)} highlight />
        <StatCard label="Registrations" value={formatNumber(stats.registrations)} />
        <StatCard label="Completed Trips" value={formatNumber(stats.completedTrips)} />
        <StatCard label="Milestones Achieved" value={formatNumber(stats.milestonesAchieved)} />
        <StatCard
          label="Rewards Redeemed"
          value={formatNumber(stats.rewardsRedeemed)}
          sub={stats.redemptionRate ? `${stats.redemptionRate}% rate` : undefined}
        />
        <StatCard
          label="Outstanding Liability"
          value={formatCurrency(stats.outstandingLiability)}
        />
      </div>

      <div className="funnel-steps">
        {funnelSteps.map((step) => (
          <div key={step.name} className="funnel-step">
            <div className="count">{formatNumber(step.count)}</div>
            <div className="name">{step.name}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <Card title="Reward Ladder Progress">
          <p className="text-muted mb-16">
            Your customers earn rewards at 3, 9 and 15 completed trips (riders). Counter resets after each redemption.
          </p>
          <div className="metric-row">
            <span>Tier 1 rewards issued</span>
            <strong>{formatNumber(rewardLadder.tier1Issued)}</strong>
          </div>
          <div className="metric-row">
            <span>Tier 2 rewards issued</span>
            <strong>{formatNumber(rewardLadder.tier2Issued)}</strong>
          </div>
          <div className="metric-row">
            <span>Tier 3 rewards issued</span>
            <strong>{formatNumber(rewardLadder.tier3Issued)}</strong>
          </div>
          <div className="metric-row">
            <span>Ladders closed</span>
            <strong>{formatNumber(rewardLadder.laddersClosed)} users</strong>
          </div>
        </Card>

        <Card title="Recent Activity">
          {recentActivity.length === 0 ? (
            <p className="text-muted">No recent activity yet.</p>
          ) : (
            recentActivity.map((item) => (
              <div key={item.id} className="metric-row">
                <div>
                  <strong>{item.title}</strong>
                  <div className="text-muted">{item.description}</div>
                </div>
                <span className="text-muted">{formatRelativeTime(item.occurredAt)}</span>
              </div>
            ))
          )}
        </Card>
      </div>
    </>
  )
}
