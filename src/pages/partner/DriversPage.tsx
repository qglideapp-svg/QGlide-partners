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
  driverBadgeStatus,
  downloadPartnerDriversExport,
  fetchPartnerDriver,
  fetchPartnerDrivers,
  parseDriverUploadCsv,
  uploadPartnerDriverRoster,
} from '../../api/partnerDrivers'
import { Badge, Card, formatCurrency, formatNumber, PageHeader, StatCard } from '../../components/ui'
import { DriversSkeleton } from '../../components/skeletons/PartnerPageSkeletons'
import { useAuth } from '../../context/AuthContext'
import { clearSession } from '../../lib/authStorage'
import { handlePartnerApiFailure, requirePartnerSession } from '../../lib/partnerLoader'
import type {
  DriverMatchStatusFilter,
  DriversPageLoaderData,
  PartnerDriverItem,
} from '../../types/drivers'

interface UploadActionResult {
  ok: boolean
  error?: string
  uploadedCount?: number
}

const MATCH_STATUS_OPTIONS: Array<{ value: '' | DriverMatchStatusFilter; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending match' },
  { value: 'matched', label: 'Matched' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'duplicate', label: 'Duplicate' },
]

function formatPartnerCategory(category: string): string {
  return `${category.charAt(0).toUpperCase()}${category.slice(1)}`
}

export async function loader({ request }: LoaderFunctionArgs): Promise<DriversPageLoaderData> {
  const session = requirePartnerSession()

  if (session.partner.category === 'restaurant') {
    return {
      mode: 'unsupported',
      partnerCategory: session.partner.category,
    }
  }

  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? '1')
  const limit = Number(url.searchParams.get('limit') ?? '50')
  const search = url.searchParams.get('search')?.trim() ?? ''
  const matchStatus = url.searchParams.get('match_status')?.trim() as DriverMatchStatusFilter | ''

  const result = await fetchPartnerDrivers(session.access_token, {
    page,
    limit,
    search: search || undefined,
    match_status: matchStatus || undefined,
  })

  if (!result.success) {
    if (/token/i.test(result.error)) {
      handlePartnerApiFailure(result.error)
    }

    return { mode: 'error', error: result.error }
  }

  return { mode: 'live', data: result.data }
}

export async function action({ request }: ActionFunctionArgs): Promise<UploadActionResult> {
  const session = requirePartnerSession()

  if (session.partner.category === 'restaurant') {
    return {
      ok: false,
      error: 'Driver roster upload is not available for restaurant partners.',
    }
  }

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent !== 'upload-roster') {
    return { ok: false, error: 'Unknown action.' }
  }

  const file = formData.get('file')
  if (!(file instanceof File) || !file.name.trim()) {
    return { ok: false, error: 'Please select a CSV file to upload.' }
  }

  let text: string

  try {
    text = await file.text()
  } catch {
    return { ok: false, error: 'Unable to read the selected file.' }
  }

  const rows = parseDriverUploadCsv(text)
  if (rows.length === 0) {
    return {
      ok: false,
      error: 'No valid driver rows found. Each row needs at least a name and phone number.',
    }
  }

  const result = await uploadPartnerDriverRoster(session.access_token, {
    filename: file.name,
    rows,
  })

  if (!result.success) {
    if (/token/i.test(result.error)) {
      clearSession()
      throw new Response('Session expired', { status: 401 })
    }
    return { ok: false, error: result.error }
  }

  return { ok: true, uploadedCount: rows.length }
}

export function HydrateFallback() {
  return <DriversSkeleton />
}

function buildDriversSearchParams(input: {
  page?: number
  search?: string
  match_status?: string
}): string {
  const params = new URLSearchParams()

  if (input.search?.trim()) params.set('search', input.search.trim())
  if (input.match_status?.trim()) params.set('match_status', input.match_status.trim())
  if (input.page && input.page > 1) params.set('page', String(input.page))

  return params.toString()
}

export function Component() {
  const loaderData = useLoaderData() as DriversPageLoaderData
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const fetcher = useFetcher<UploadActionResult>()
  const { session } = useAuth()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [viewDriver, setViewDriver] = useState<PartnerDriverItem | null>(null)
  const [viewError, setViewError] = useState<string | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const [searchParams] = useSearchParams()
  const currentSearch = searchParams.get('search') ?? ''
  const currentMatchStatus = searchParams.get('match_status') ?? ''

  const isUploading = fetcher.state !== 'idle'
  const uploadError = fetcher.data?.ok === false ? fetcher.data.error : null
  const uploadSuccess = fetcher.data?.ok === true

  useEffect(() => {
    if (!uploadSuccess) return
    setShowUploadModal(false)
    revalidator.revalidate()
  }, [uploadSuccess, revalidator])

  useEffect(() => {
    if (!selectedDriverId || !session?.access_token) return

    let cancelled = false
    setViewLoading(true)
    setViewError(null)
    setViewDriver(null)

    void fetchPartnerDriver(session.access_token, selectedDriverId).then((result) => {
      if (cancelled) return

      if (!result.success) {
        if (/token/i.test(result.error)) {
          clearSession()
          navigate('/login')
          return
        }
        setViewError(result.error)
      } else {
        setViewDriver(result.data)
      }

      setViewLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [selectedDriverId, session?.access_token, navigate])

  async function handleExport() {
    if (!session?.access_token || exporting) return

    setExporting(true)
    setExportError(null)

    try {
      const result = await downloadPartnerDriversExport(session.access_token, {
        search: currentSearch || undefined,
        match_status: (currentMatchStatus as DriverMatchStatusFilter) || undefined,
      })

      if (!result.success) {
        if (/token/i.test(result.error)) {
          clearSession()
          navigate('/login')
          return
        }
        setExportError(result.error)
      }
    } catch {
      setExportError('Unable to export roster. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  function closeViewModal() {
    setSelectedDriverId(null)
    setViewDriver(null)
    setViewError(null)
    setViewLoading(false)
  }

  if (loaderData.mode === 'unsupported') {
    const categoryLabel = formatPartnerCategory(loaderData.partnerCategory)

    return (
      <>
        <PageHeader
          title="Drivers"
          description="Fleet driver management is available for limousine partners"
        />
        <div className="card">
          <div className="card-body empty-state">
            <p>Your partner account ({categoryLabel}) does not include fleet driver management.</p>
            <p className="text-muted mt-16">
              Limousine partners can upload driver rosters, track match status and view per-driver
              earnings here.
            </p>
          </div>
        </div>
      </>
    )
  }

  if (loaderData.mode === 'error') {
    return (
      <>
        <PageHeader
          title="Drivers"
          description="Upload driver rosters, track match status and view per-driver earnings"
        />
        <div className="card">
          <div className="card-body empty-state">
            <p>Unable to load driver roster.</p>
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

  const { summary, drivers, page: currentPage, totalCount, limit } = loaderData.data
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  return (
    <>
      <PageHeader
        title="Drivers"
        description="Upload driver rosters, track match status and view per-driver earnings"
        actions={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void handleExport()}
              disabled={!session?.access_token || exporting}
            >
              {exporting ? 'Exporting…' : 'Export roster'}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
              Upload roster
            </button>
          </>
        }
      />

      {exportError && (
        <div className="login-error" role="alert">
          {exportError}
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="Active drivers" value={formatNumber(summary.activeDrivers)} highlight />
        <StatCard
          label="Pending match"
          value={formatNumber(summary.pendingMatch)}
          sub="Awaiting QGlide registration"
        />
        <StatCard label="Total trips" value={formatNumber(summary.totalTrips)} />
        <StatCard
          label="Net driver earnings"
          value={formatCurrency(summary.netDriverEarningsQar)}
        />
      </div>

      <Card
        title="Driver roster"
        action={
          <Form
            method="get"
            className="earnings-period-form"
            onChange={(event) => {
              const form = event.currentTarget
              const formData = new FormData(form)
              const query = buildDriversSearchParams({
                search: String(formData.get('search') ?? ''),
                match_status: String(formData.get('match_status') ?? ''),
              })
              navigate(query ? `/partner/drivers?${query}` : '/partner/drivers')
            }}
          >
            <input
              type="search"
              name="search"
              defaultValue={currentSearch}
              className="form-input"
              placeholder="Search drivers"
              aria-label="Search drivers"
            />
            <select
              name="match_status"
              defaultValue={currentMatchStatus}
              className="form-input"
              aria-label="Filter by match status"
            >
              {MATCH_STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Form>
        }
      >
        {drivers.length === 0 ? (
          <div className="empty-state">
            <p>No drivers found for the current filters.</p>
            <p className="text-muted mt-16">Upload a CSV roster to add drivers to your fleet.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Match status</th>
                    <th>Trips</th>
                    <th>Gross</th>
                    <th>Commission</th>
                    <th>Net</th>
                    <th>Licence expiry</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td>
                        <strong>{driver.fullName}</strong>
                        {driver.phoneMasked && (
                          <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
                            {driver.phoneMasked}
                          </div>
                        )}
                      </td>
                      <td>{driver.vehicleLabel || '—'}</td>
                      <td>
                        <Badge
                          status={driverBadgeStatus(driver.matchStatusLabel)}
                          label={driver.matchStatusLabel}
                        />
                        {driver.matchStatusDetail && (
                          <div className="text-muted" style={{ fontSize: '0.8125rem', marginTop: 4 }}>
                            {driver.matchStatusDetail}
                          </div>
                        )}
                      </td>
                      <td>{formatNumber(driver.trips)}</td>
                      <td>{formatCurrency(driver.earnings.grossQar)}</td>
                      <td>{formatCurrency(driver.earnings.commissionQar)}</td>
                      <td>{formatCurrency(driver.earnings.netQar)}</td>
                      <td>{driver.licenseExpiry || '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedDriverId(driver.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="action-row action-row--start mt-16">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    const query = buildDriversSearchParams({
                      page: currentPage - 1,
                      search: currentSearch,
                      match_status: currentMatchStatus,
                    })
                    navigate(`/partner/drivers?${query}`)
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
                    const query = buildDriversSearchParams({
                      page: currentPage + 1,
                      search: currentSearch,
                      match_status: currentMatchStatus,
                    })
                    navigate(`/partner/drivers?${query}`)
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      {showUploadModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !isUploading && setShowUploadModal(false)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-roster-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="upload-roster-title">Upload driver roster</h2>
            <p className="text-muted">
              Upload a CSV with columns such as name, phone, license_number, license_expiry, vehicle_make,
              vehicle_model and vehicle_plate.
            </p>

            {uploadError && (
              <div className="login-error" role="alert">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="form-success" role="status">
                Uploaded {fetcher.data?.uploadedCount ?? 0} driver
                {(fetcher.data?.uploadedCount ?? 0) === 1 ? '' : 's'}. Refreshing roster…
              </div>
            )}

            <fetcher.Form method="post" encType="multipart/form-data" className="sub-code-form">
              <input type="hidden" name="intent" value="upload-roster" />
              <div className="form-group">
                <label htmlFor="driver-roster-file">CSV file</label>
                <input
                  id="driver-roster-file"
                  name="file"
                  type="file"
                  accept=".csv,text/csv"
                  className="form-input"
                  required
                  disabled={isUploading}
                />
              </div>
              <div className="action-row action-row--start">
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  {isUploading ? 'Uploading…' : 'Upload roster'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}

      {selectedDriverId && (
        <div className="modal-backdrop" role="presentation" onClick={closeViewModal}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-driver-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="view-driver-title">Driver details</h2>

            {viewLoading && <p className="text-muted">Loading driver…</p>}

            {viewError && (
              <div className="login-error" role="alert">
                {viewError}
              </div>
            )}

            {viewDriver && (
              <>
                <div className="info-list">
                  <div className="info-item">
                    <span className="key">Name</span>
                    <span className="val">{viewDriver.fullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="key">Phone</span>
                    <span className="val">{viewDriver.phoneMasked || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="key">Vehicle</span>
                    <span className="val">{viewDriver.vehicleLabel || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="key">Match status</span>
                    <span className="val">
                      <Badge
                        status={driverBadgeStatus(viewDriver.matchStatusLabel)}
                        label={viewDriver.matchStatusLabel}
                      />
                    </span>
                  </div>
                  {viewDriver.matchStatusDetail && (
                    <div className="info-item">
                      <span className="key">Status detail</span>
                      <span className="val">{viewDriver.matchStatusDetail}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="key">Trips</span>
                    <span className="val">{formatNumber(viewDriver.trips)}</span>
                  </div>
                  <div className="info-item">
                    <span className="key">Gross earnings</span>
                    <span className="val">{formatCurrency(viewDriver.earnings.grossQar)}</span>
                  </div>
                  <div className="info-item">
                    <span className="key">Commission</span>
                    <span className="val">{formatCurrency(viewDriver.earnings.commissionQar)}</span>
                  </div>
                  <div className="info-item">
                    <span className="key">Net earnings</span>
                    <span className="val">{formatCurrency(viewDriver.earnings.netQar)}</span>
                  </div>
                  <div className="info-item">
                    <span className="key">Licence expiry</span>
                    <span className="val">{viewDriver.licenseExpiry || '—'}</span>
                  </div>
                </div>
                <div className="action-row action-row--start mt-16">
                  <button type="button" className="btn btn-secondary" onClick={closeViewModal}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
