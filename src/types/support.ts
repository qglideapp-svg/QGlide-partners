export type SupportTicketStatusFilter = 'open' | 'pending' | 'resolved'

export type SupportTicketCategory =
  | 'partner_attribution_dispute'
  | 'partner_sub_code_request'
  | 'partner_settlement_dispute'
  | 'partner_voucher_dispute'
  | 'partner_general'

export interface SupportTicketItem {
  id: string
  ticketLabel: string
  ticketNumber: string
  subject: string
  status: string
  statusLabel: string
  date: string
  category: string
  attributionId?: string
}

export interface SupportTicketMessage {
  id: string
  authorLabel?: string
  authorType?: string
  message: string
  sentAt: string
}

export interface SupportTicketDetail extends SupportTicketItem {
  messages: SupportTicketMessage[]
  voucherCode?: string
}

export interface PartnerSupportTicketsData {
  title: string
  subtitle: string
  tickets: SupportTicketItem[]
  totalCount: number
  page: number
  limit: number
}

export interface CreateSupportTicketInput {
  subject: string
  message: string
  category?: SupportTicketCategory
  attribution_id?: string
  voucher_code?: string
}

export interface ReplySupportTicketInput {
  message: string
}

export interface PartnerSupportTicketsQuery {
  status?: SupportTicketStatusFilter
  page?: number
  limit?: number
}

export type SupportPageLoaderData =
  | { mode: 'live'; data: PartnerSupportTicketsData }
  | { mode: 'error'; error: string }
