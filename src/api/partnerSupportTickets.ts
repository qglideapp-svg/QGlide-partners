import { partnerGet, partnerPost } from './client'
import type {
  CreateSupportTicketInput,
  PartnerSupportTicketsData,
  PartnerSupportTicketsQuery,
  ReplySupportTicketInput,
  SupportTicketDetail,
  SupportTicketItem,
  SupportTicketMessage,
} from '../types/support'

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
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

function normalizeTicket(raw: unknown, index: number): SupportTicketItem {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>

  return {
    id: String(item.id ?? item.ticket_id ?? `ticket-${index}`),
    ticketLabel: String(item.ticket_label ?? item.ticketLabel ?? item.label ?? `#${index + 1}`),
    ticketNumber: String(item.ticket_number ?? item.ticketNumber ?? item.number ?? ''),
    subject: String(item.subject ?? item.title ?? 'Support ticket'),
    status: String(item.status ?? 'open'),
    statusLabel: String(item.status_label ?? item.statusLabel ?? item.status ?? 'Open'),
    date: String(item.date ?? item.created_at ?? item.opened_at ?? item.updated_at ?? ''),
    category: String(item.category ?? item.type ?? 'partner_general'),
    attributionId: toOptionalString(item.attribution_id ?? item.attributionId),
  }
}

function normalizeMessage(raw: unknown, index: number): SupportTicketMessage {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>

  return {
    id: String(item.id ?? `message-${index}`),
    authorLabel: toOptionalString(
      item.author_label ?? item.authorLabel ?? item.author_name ?? item.author ?? item.from,
    ),
    authorType: toOptionalString(item.author_type ?? item.authorType ?? item.sender_type),
    message: String(item.message ?? item.body ?? item.content ?? item.text ?? ''),
    sentAt: String(item.sent_at ?? item.sentAt ?? item.created_at ?? item.timestamp ?? ''),
  }
}

function normalizeTicketList(raw: unknown): PartnerSupportTicketsData {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const tickets = Array.isArray(data.tickets) ? data.tickets : []

  return {
    title: String(data.title ?? 'Support & Disputes'),
    subtitle: String(data.subtitle ?? 'Raise tickets tied directly to your attribution records.'),
    tickets: tickets.map(normalizeTicket),
    totalCount: toNumber(data.total_count ?? data.totalCount ?? tickets.length),
    page: toNumber(data.page) || 1,
    limit: toNumber(data.limit) || tickets.length || 20,
  }
}

function normalizeTicketDetail(raw: unknown): SupportTicketDetail {
  const payload = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const ticketSource = pickRecord(payload, ['ticket', 'data'])
  const merged = { ...payload, ...ticketSource }
  const base = normalizeTicket(merged, 0)
  const messagesSource = Array.isArray(merged.messages)
    ? merged.messages
    : Array.isArray(merged.conversation)
      ? merged.conversation
      : Array.isArray(merged.replies)
        ? merged.replies
        : []

  return {
    ...base,
    voucherCode: toOptionalString(merged.voucher_code ?? merged.voucherCode),
    messages: messagesSource.map(normalizeMessage),
  }
}

export async function fetchPartnerSupportTickets(
  accessToken: string,
  query: PartnerSupportTicketsQuery = {},
): Promise<{ success: true; data: PartnerSupportTicketsData } | { success: false; error: string }> {
  const result = await partnerGet<unknown>('partner-support-tickets', accessToken, {
    status: query.status,
    page: query.page,
    limit: query.limit,
    ticket_id: undefined,
  })

  if (!result.success) {
    return result
  }

  return {
    success: true,
    data: normalizeTicketList(result.data),
  }
}

export async function fetchPartnerSupportTicket(
  accessToken: string,
  ticketId: string,
): Promise<{ success: true; data: SupportTicketDetail } | { success: false; error: string }> {
  const trimmedId = ticketId.trim()
  if (!trimmedId) {
    return { success: false, error: 'Ticket ID is required.' }
  }

  const result = await partnerGet<unknown>('partner-support-tickets', accessToken, {
    ticket_id: trimmedId,
  })

  if (!result.success) {
    return result
  }

  return {
    success: true,
    data: normalizeTicketDetail(result.data),
  }
}

export async function createPartnerSupportTicket(
  accessToken: string,
  input: CreateSupportTicketInput,
): Promise<{ success: true; data: SupportTicketDetail | SupportTicketItem } | { success: false; error: string }> {
  const subject = input.subject.trim()
  const message = input.message.trim()

  if (!subject) {
    return { success: false, error: 'Subject is required.' }
  }

  if (!message) {
    return { success: false, error: 'Message is required.' }
  }

  const body: Record<string, string> = { subject, message }

  if (input.category) body.category = input.category
  if (input.attribution_id?.trim()) body.attribution_id = input.attribution_id.trim()
  if (input.voucher_code?.trim()) body.voucher_code = input.voucher_code.trim()

  const result = await partnerPost<unknown>('partner-support-tickets', accessToken, body)

  if (!result.success) {
    return result
  }

  const payload = result.data
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (record.ticket || record.messages || record.conversation) {
      return { success: true, data: normalizeTicketDetail(payload) }
    }
  }

  return { success: true, data: normalizeTicket(payload, 0) }
}

export async function replyToPartnerSupportTicket(
  accessToken: string,
  ticketId: string,
  input: ReplySupportTicketInput,
): Promise<{ success: true; data: SupportTicketDetail | null } | { success: false; error: string }> {
  const trimmedId = ticketId.trim()
  const message = input.message.trim()

  if (!trimmedId) {
    return { success: false, error: 'Ticket ID is required.' }
  }

  if (!message) {
    return { success: false, error: 'Reply message is required.' }
  }

  const result = await partnerPost<unknown>(
    'partner-support-tickets',
    accessToken,
    { message },
    { ticket_id: trimmedId },
  )

  if (!result.success) {
    return result
  }

  if (result.data && typeof result.data === 'object') {
    return { success: true, data: normalizeTicketDetail(result.data) }
  }

  return { success: true, data: null }
}

export function supportTicketBadgeStatus(status: string): string {
  switch (status.trim().toLowerCase()) {
    case 'open':
    case 'active':
      return 'open'
    case 'pending':
      return 'pending'
    case 'resolved':
    case 'closed':
      return 'resolved'
    default:
      return status.trim().toLowerCase().replace(/\s+/g, '_') || 'open'
  }
}
