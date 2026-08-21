export interface StatementArchiveItem {
  id: string
  periodLabel: string
  periodStart: string
  periodEnd: string
  netQar: number
  netAmountLabel: string
  generatedAt: string
  status: string
  statusLabel: string
  redemptionsCount: number
}

export interface PartnerStatementsData {
  statements: StatementArchiveItem[]
  totalCount: number
}

export type StatementsPageLoaderData =
  | { mode: 'live'; data: PartnerStatementsData }
  | { mode: 'error'; error: string }
