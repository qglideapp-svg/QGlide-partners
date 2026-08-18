export interface DashboardStats {
  scans: number
  downloads: number
  registrations: number
  completedTrips: number
  milestonesAchieved: number
  rewardsRedeemed: number
  redemptionRate: number
  outstandingLiability: number
}

export interface RewardLadderSummary {
  tier1Issued: number
  tier2Issued: number
  tier3Issued: number
  laddersClosed: number
}

export interface DashboardActivityItem {
  id: string
  type: string
  title: string
  description: string
  occurredAt: string
}

export interface PartnerDashboardData {
  stats: DashboardStats
  rewardLadder: RewardLadderSummary
  recentActivity: DashboardActivityItem[]
}
