import { useEffect, useState } from 'react'
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router-dom'
import {
  createPartnerSupportTicket,
  fetchPartnerSupportTicket,
  fetchPartnerSupportTickets,
  replyToPartnerSupportTicket,
  supportTicketBadgeStatus,
} from '../../api/partnerSupportTickets'
import { Badge, Card, PageHeader } from '../../components/ui'
import { SupportSkeleton } from '../../components/skeletons/PartnerPageSkeletons'
import { useAuth } from '../../context/AuthContext'
import { clearSession } from '../../lib/authStorage'
import { handlePartnerApiFailure, requirePartnerSession } from '../../lib/partnerLoader'
import type {
  SupportPageLoaderData,
  SupportTicketCategory,
  SupportTicketDetail,
  SupportTicketStatusFilter,
} from '../../types/support'

interface SupportActionResult {
  ok: boolean
  error?: string
  ticketId?: string
}

const STATUS_OPTIONS: Array<{ value: '' | SupportTicketStatusFilter; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
]

const CATEGORY_OPTIONS: Array<{ value: '' | SupportTicketCategory; label: string }> = [
  { value: '', label: 'Auto-detect from subject' },
  { value: 'partner_attribution_dispute', label: 'Attribution dispute' },
  { value: 'partner_sub_code_request', label: 'Sub-code request' },
  { value: 'partner_settlement_dispute', label: 'Settlement dispute' },
  { value: 'partner_voucher_dispute', label: 'Voucher dispute' },
  { value: 'partner_general', label: 'General support' },
]

export async function loader({ request }: LoaderFunctionArgs): Promise<SupportPageLoaderData> {
  const session = requirePartnerSession()
  const url = new URL(request.url)
  const status = url.searchParams.get('status')?.trim() as SupportTicketStatusFilter | ''
  const page = Number(url.searchParams.get('page') ?? '1')
  const limit = Number(url.searchParams.get('limit') ?? '20')

  const result = await fetchPartnerSupportTickets(session.access_token, {
    status: status || undefined,
    page,
    limit,
  })

  if (!result.success) {
    if (/token/i.test(result.error)) {
      handlePartnerApiFailure(result.error)
    }

    return { mode: 'error', error: result.error }
  }

  return { mode: 'live', data: result.data }
}

export async function action({ request }: ActionFunctionArgs): Promise<SupportActionResult> {
  const session = requirePartnerSession()
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'create-ticket') {
    const subject = String(formData.get('subject') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    const category = String(formData.get('category') ?? '').trim() as SupportTicketCategory | ''
    const attributionId = String(formData.get('attribution_id') ?? '').trim()
    const voucherCode = String(formData.get('voucher_code') ?? '').trim()

    const result = await createPartnerSupportTicket(session.access_token, {
      subject,
      message,
      category: category || undefined,
      attribution_id: attributionId || undefined,
      voucher_code: voucherCode || undefined,
    })

    if (!result.success) {
      if (/token/i.test(result.error)) {
        clearSession()
        throw new Response('Session expired', { status: 401 })
      }
      return { ok: false, error: result.error }
    }

    return { ok: true, ticketId: result.data.id }
  }

  if (intent === 'reply-ticket') {
    const ticketId = String(formData.get('ticket_id') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()

    const result = await replyToPartnerSupportTicket(session.access_token, ticketId, { message })

    if (!result.success) {
      if (/token/i.test(result.error)) {
        clearSession()
        throw new Response('Session expired', { status: 401 })
      }
      return { ok: false, error: result.error }
    }

    return { ok: true, ticketId }
  }

  return { ok: false, error: 'Unknown action.' }
}

export function HydrateFallback() {
  return <SupportSkeleton />
}

function buildSupportSearchParams(input: {
  page?: number
  status?: string
}): string {
  const params = new URLSearchParams()

  if (input.status?.trim()) params.set('status', input.status.trim())
  if (input.page && input.page > 1) params.set('page', String(input.page))

  return params.toString()
}

export function Component() {
  const loaderData = useLoaderData() as SupportPageLoaderData
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const createFetcher = useFetcher<SupportActionResult>()
  const replyFetcher = useFetcher<SupportActionResult>()
  const { session } = useAuth()
  const [searchParams] = useSearchParams()
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [ticketDetail, setTicketDetail] = useState<SupportTicketDetail | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const currentStatus = searchParams.get('status') ?? ''
  const isCreating = createFetcher.state !== 'idle'
  const isReplying = replyFetcher.state !== 'idle'
  const createError = createFetcher.data?.ok === false ? createFetcher.data.error : null
  const createSuccess = createFetcher.data?.ok === true
  const replyError = replyFetcher.data?.ok === false ? replyFetcher.data.error : null
  const replySuccess = replyFetcher.data?.ok === true

  useEffect(() => {
    if (!createSuccess) return
    setShowNewTicketForm(false)
    if (createFetcher.data?.ticketId) {
      setSelectedTicketId(createFetcher.data.ticketId)
    }
    revalidator.revalidate()
  }, [createSuccess, createFetcher.data?.ticketId, revalidator])

  useEffect(() => {
    if (!selectedTicketId || !session?.access_token) return

    let cancelled = false

    setDetailLoading(true)
    setDetailError(null)
    setTicketDetail(null)

    void fetchPartnerSupportTicket(session.access_token, selectedTicketId).then((result) => {
      if (cancelled) return

      if (!result.success) {
        if (/token/i.test(result.error)) {
          clearSession()
          navigate('/login')
          return
        }
        setDetailError(result.error)
      } else {
        setTicketDetail(result.data)
      }

      setDetailLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [selectedTicketId, session?.access_token, navigate, replySuccess])

  if (loaderData.mode === 'error') {
    return (
      <>
        <PageHeader
          title="Support & Disputes"
          description="Raise tickets tied directly to your attribution records"
        />
        <div className="card">
          <div className="card-body empty-state">
            <p>Unable to load support tickets.</p>
            <p className="text-muted mt-16">{loaderData.error}</p>
            <button
              type="button"
              className="btn btn-primary mt-16"
              onClick={() => revalidator.revalidate()}
            >
              Try again
            </button>
          </div>
        </div>
      </>
    )
  }

  const { title, subtitle, tickets, page: currentPage, totalCount, limit } = loaderData.data
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  function closeTicketDetail() {
    setSelectedTicketId(null)
    setTicketDetail(null)
    setDetailError(null)
    setDetailLoading(false)
  }

  return (
    <>
      <PageHeader
        title={title}
        description={subtitle}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setShowNewTicketForm(true)}>
            New ticket
          </button>
        }
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2>Ticket History</h2>
            <Form
              method="get"
              className="earnings-period-form"
              onChange={(event) => {
                const form = event.currentTarget
                const formData = new FormData(form)
                const query = buildSupportSearchParams({
                  status: String(formData.get('status') ?? ''),
                })
                navigate(query ? `/partner/support?${query}` : '/partner/support')
              }}
            >
              <select
                name="status"
                defaultValue={currentStatus}
                className="form-input"
                aria-label="Filter by ticket status"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Form>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {tickets.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <p>No support tickets yet.</p>
                <p className="text-muted mt-16">Submit a ticket if you need help with attribution or settlements.</p>
              </div>
            ) : (
              <>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticket</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          <td>{ticket.ticketLabel || ticket.ticketNumber}</td>
                          <td>{ticket.subject}</td>
                          <td>{ticket.date || '—'}</td>
                          <td>
                            <Badge
                              status={supportTicketBadgeStatus(ticket.status)}
                              label={ticket.statusLabel}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="action-row action-row--start" style={{ padding: 16 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={currentPage <= 1}
                      onClick={() => {
                        const query = buildSupportSearchParams({
                          page: currentPage - 1,
                          status: currentStatus,
                        })
                        navigate(`/partner/support?${query}`)
                      }}
                    >
                      Previous
                    </button>
                    <span className="text-muted">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => {
                        const query = buildSupportSearchParams({
                          page: currentPage + 1,
                          status: currentStatus,
                        })
                        navigate(`/partner/support?${query}`)
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <Card title="Contact Support">
          <p className="text-muted">
            Include voucher numbers, user IDs, or attribution references so we can investigate faster.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setShowNewTicketForm(true)}>
            Open ticket form
          </button>
        </Card>
      </div>

      {showNewTicketForm && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !isCreating && setShowNewTicketForm(false)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-ticket-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="new-ticket-title">New support ticket</h2>
            <p className="text-muted">Describe your issue and include any voucher or attribution references.</p>

            {createError && (
              <div className="login-error" role="alert">
                {createError}
              </div>
            )}

            {createSuccess && (
              <div className="form-success" role="status">
                Ticket submitted. Opening conversation…
              </div>
            )}

            <createFetcher.Form method="post" className="sub-code-form">
              <input type="hidden" name="intent" value="create-ticket" />
              <div className="form-group">
                <label htmlFor="ticket-subject">Subject</label>
                <input
                  id="ticket-subject"
                  name="subject"
                  type="text"
                  className="form-input"
                  placeholder="Attribution dispute — user u-2847"
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ticket-category">Category</label>
                <select id="ticket-category" name="category" className="form-input" disabled={isCreating}>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ticket-voucher">Voucher code (optional)</label>
                <input
                  id="ticket-voucher"
                  name="voucher_code"
                  type="text"
                  className="form-input text-mono"
                  placeholder="QGV-K7M2NP4X"
                  disabled={isCreating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ticket-attribution">Attribution ID (optional)</label>
                <input
                  id="ticket-attribution"
                  name="attribution_id"
                  type="text"
                  className="form-input"
                  placeholder="Attribution UUID"
                  disabled={isCreating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ticket-message">Message</label>
                <textarea
                  id="ticket-message"
                  name="message"
                  className="form-input"
                  rows={4}
                  placeholder="Include voucher numbers or user IDs if relevant"
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="action-row action-row--start">
                <button type="submit" className="btn btn-primary" disabled={isCreating}>
                  {isCreating ? 'Submitting…' : 'Submit ticket'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewTicketForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
              </div>
            </createFetcher.Form>
          </div>
        </div>
      )}

      {selectedTicketId && (
        <div className="modal-backdrop" role="presentation" onClick={closeTicketDetail}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            {detailLoading && <p className="text-muted">Loading ticket…</p>}

            {detailError && (
              <div className="login-error" role="alert">
                {detailError}
              </div>
            )}

            {ticketDetail && (
              <>
                <h2 id="ticket-detail-title">
                  {ticketDetail.ticketLabel || ticketDetail.ticketNumber || 'Ticket detail'}
                </h2>
                <p className="text-muted">{ticketDetail.subject}</p>

                <div className="info-list mt-16">
                  <div className="info-item">
                    <span className="key">Status</span>
                    <span className="val">
                      <Badge
                        status={supportTicketBadgeStatus(ticketDetail.status)}
                        label={ticketDetail.statusLabel}
                      />
                    </span>
                  </div>
                  {ticketDetail.ticketNumber && (
                    <div className="info-item">
                      <span className="key">Ticket number</span>
                      <span className="val">{ticketDetail.ticketNumber}</span>
                    </div>
                  )}
                  {ticketDetail.date && (
                    <div className="info-item">
                      <span className="key">Opened</span>
                      <span className="val">{ticketDetail.date}</span>
                    </div>
                  )}
                  {ticketDetail.voucherCode && (
                    <div className="info-item">
                      <span className="key">Voucher</span>
                      <span className="val">{ticketDetail.voucherCode}</span>
                    </div>
                  )}
                </div>

                <div className="mt-16">
                  <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>Conversation</h3>
                  {ticketDetail.messages.length === 0 ? (
                    <p className="text-muted">No messages yet.</p>
                  ) : (
                    <div className="info-list">
                      {ticketDetail.messages.map((message) => (
                        <div className="info-item" key={message.id} style={{ alignItems: 'flex-start' }}>
                          <span className="key">
                            {message.authorLabel || message.authorType || 'Message'}
                            {message.sentAt ? ` · ${message.sentAt}` : ''}
                          </span>
                          <span className="val" style={{ whiteSpace: 'pre-wrap' }}>
                            {message.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {replyError && (
                  <div className="login-error mt-16" role="alert">
                    {replyError}
                  </div>
                )}

                {replySuccess && (
                  <div className="form-success mt-16" role="status">
                    Reply sent.
                  </div>
                )}

                <replyFetcher.Form method="post" className="sub-code-form mt-16">
                  <input type="hidden" name="intent" value="reply-ticket" />
                  <input type="hidden" name="ticket_id" value={ticketDetail.id} />
                  <div className="form-group">
                    <label htmlFor="ticket-reply">Reply</label>
                    <textarea
                      id="ticket-reply"
                      name="message"
                      className="form-input"
                      rows={3}
                      placeholder="Add an update or additional details"
                      required
                      disabled={isReplying}
                    />
                  </div>
                  <div className="action-row action-row--start">
                    <button type="submit" className="btn btn-primary" disabled={isReplying}>
                      {isReplying ? 'Sending…' : 'Send reply'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeTicketDetail}>
                      Close
                    </button>
                  </div>
                </replyFetcher.Form>
              </>
            )}

            {!detailLoading && !ticketDetail && !detailError && (
              <div className="action-row action-row--start mt-16">
                <button type="button" className="btn btn-secondary" onClick={closeTicketDetail}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
