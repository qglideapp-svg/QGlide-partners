import { partnerGet } from './client'
import type {
  DashboardActivityItem,
  PartnerDashboardData,
  RewardLadderSummary,
  DashboardStats,
} from '../types/dashboard'

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
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

function normalizeStats(raw: Record<string, unknown>): DashboardStats {
  const source = pickRecord(raw, ['stats', 'summary', 'metrics', 'performance'])

  return {
    scans: toNumber(source.scans),
    downloads: toNumber(source.downloads),
    registrations: toNumber(source.registrations),
    completedTrips: toNumber(source.completed_trips ?? source.completedTrips ?? source.trips),
    milestonesAchieved: toNumber(
      source.milestones_achieved ?? source.milestonesAchieved ?? source.rewards_issued,
    ),
    rewardsRedeemed: toNumber(source.rewards_redeemed ?? source.rewardsRedeemed),
    redemptionRate: toNumber(source.redemption_rate ?? source.redemptionRate),
    outstandingLiability: toNumber(
      source.outstanding_liability ?? source.outstandingLiability ?? source.liability,
    ),
  }
}

function normalizeRewardLadder(raw: Record<string, unknown>): RewardLadderSummary {
  const source = pickRecord(raw, ['reward_ladder', 'rewardLadder', 'ladder', 'rewards'])

  return {
    tier1Issued: toNumber(
      source.tier_1_issued ?? source.tier_1_rewards_issued ?? source.tier1Issued,
    ),
    tier2Issued: toNumber(
      source.tier_2_issued ?? source.tier_2_rewards_issued ?? source.tier2Issued,
    ),
    tier3Issued: toNumber(
      source.tier_3_issued ?? source.tier_3_rewards_issued ?? source.tier3Issued,
    ),
    laddersClosed: toNumber(source.ladders_closed ?? source.laddersClosed),
  }
}

function activityTitle(type: string, rawTitle?: unknown): string {
  if (typeof rawTitle === 'string' && rawTitle.trim()) return rawTitle

  switch (type) {
    case 'milestone_reached':
    case 'milestone':
      return 'Milestone reached'
    case 'voucher_redeemed':
    case 'redemption':
      return 'Voucher redeemed'
    case 'registration':
    case 'new_registration':
      return 'New registration'
    case 'scan':
      return 'Code scanned'
    case 'download':
      return 'App downloaded'
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }
}

function normalizeActivity(raw: unknown, index: number): DashboardActivityItem {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const type = String(item.type ?? item.event_type ?? 'activity')

  return {
    id: String(item.id ?? `${type}-${index}`),
    type,
    title: activityTitle(type, item.title ?? item.summary),
    description: String(
      item.description ?? item.detail ?? item.message ?? item.subtitle ?? 'Activity recorded',
    ),
    occurredAt: String(
      item.occurred_at ?? item.created_at ?? item.timestamp ?? new Date().toISOString(),
    ),
  }
}

function normalizeDashboard(raw: unknown): PartnerDashboardData {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const activity = Array.isArray(data.recent_activity)
    ? data.recent_activity
    : Array.isArray(data.activity)
      ? data.activity
      : []

  return {
    stats: normalizeStats(data),
    rewardLadder: normalizeRewardLadder(data),
    recentActivity: activity.map(normalizeActivity),
  }
}

export async function fetchPartnerDashboard(
  accessToken: string,
  activityLimit = 10,
): Promise<{ success: true; data: PartnerDashboardData } | { success: false; error: string }> {
  const result = await partnerGet<unknown>('partner-dashboard', accessToken, {
    activity_limit: activityLimit,
  })

  if (!result.success) {
    return result
  }

  return {
    success: true,
    data: normalizeDashboard(result.data),
  }
}
