import { useState } from 'react'
import {
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
  type ActionFunctionArgs,
} from 'react-router-dom'
import { CodesSkeleton } from '../../components/skeletons/PartnerPageSkeletons'
import { downloadPartnerCodePdf, downloadPartnerCollateralPdf, fetchPartnerCodeCentre, requestPartnerSubCode } from '../../api/partnerCodeCentre'
import { Badge, Card, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { usePartnerQrArtwork } from '../../hooks/usePartnerQrArtwork'
import { clearSession } from '../../lib/authStorage'
import { handlePartnerApiFailure, requirePartnerSession } from '../../lib/partnerLoader'
import type { PartnerCodeCentreData, PartnerCodeItem, CollateralItem } from '../../types/codeCentre'

interface SubCodeActionResult {
  ok: boolean
  error?: string
}

export async function loader(): Promise<PartnerCodeCentreData> {
  const session = requirePartnerSession()
  const result = await fetchPartnerCodeCentre(session.access_token)

  if (!result.success) {
    handlePartnerApiFailure(result.error)
  }

  return result.data
}

export async function action({ request }: ActionFunctionArgs): Promise<SubCodeActionResult> {
  const session = requirePartnerSession()
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent !== 'request-sub-code') {
    return { ok: false, error: 'Unknown action.' }
  }

  const label = String(formData.get('label') ?? '').trim()
  if (!label) {
    return { ok: false, error: 'Label is required.' }
  }

  const branchId = String(formData.get('branch_id') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()

  const result = await requestPartnerSubCode(session.access_token, {
    label,
    branch_id: branchId || undefined,
    notes: notes || undefined,
  })

  if (!result.success) {
    if (/token/i.test(result.error)) {
      throw redirect('/login')
    }
    return { ok: false, error: result.error }
  }

  return { ok: true }
}

export function HydrateFallback() {
  return <CodesSkeleton />
}

function DownloadButton({
  href,
  label,
  variant = 'secondary',
  size,
}: {
  href?: string
  label: string
  variant?: 'primary' | 'secondary'
  size?: 'sm'
}) {
  const className = `btn btn-${variant}${size ? ` btn-${size}` : ''}`

  if (!href) {
    return (
      <button type="button" className={className} disabled>
        {label}
      </button>
    )
  }

  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" download>
      {label}
    </a>
  )
}

function PartnerAuthenticatedPdfButton({
  label,
  variant = 'secondary',
  size,
  download,
}: {
  label: string
  variant?: 'primary' | 'secondary'
  size?: 'sm'
  download: (accessToken: string) => Promise<{ success: true } | { success: false; error: string }>
}) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const className = `btn btn-${variant}${size ? ` btn-${size}` : ''}`

  async function handleDownload() {
    if (!session?.access_token || downloading) return

    setDownloading(true)
    setError(null)

    try {
      const result = await download(session.access_token)

      if (!result.success) {
        if (/token/i.test(result.error)) {
          clearSession()
          navigate('/login')
          return
        }

        setError(result.error)
      }
    } catch {
      setError('Unable to download PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => void handleDownload()}
        disabled={!session?.access_token || downloading}
      >
        {downloading ? 'Downloading…' : label}
      </button>
      {error && (
        <p className="text-muted" style={{ flexBasis: '100%', fontSize: '0.8125rem', margin: 0 }}>
          {error}
        </p>
      )}
    </>
  )
}

function PartnerCodePdfButton({
  codeId,
  label,
  variant = 'secondary',
  size,
}: {
  codeId?: string
  label: string
  variant?: 'primary' | 'secondary'
  size?: 'sm'
}) {
  return (
    <PartnerAuthenticatedPdfButton
      label={label}
      variant={variant}
      size={size}
      download={(accessToken) => downloadPartnerCodePdf(accessToken, codeId)}
    />
  )
}

function PartnerCollateralPdfButton({ item }: { item: CollateralItem }) {
  return (
    <PartnerAuthenticatedPdfButton
      label={item.label}
      variant="secondary"
      download={(accessToken) => downloadPartnerCollateralPdf(accessToken, item.template)}
    />
  )
}

function PartnerCodeCard({ code }: { code: PartnerCodeItem }) {
  const { pngUrl, svgUrl, loading } = usePartnerQrArtwork(code)

  return (
    <Card
      title={
        code.type === 'primary'
          ? 'Primary Code'
          : `Sub-code${code.label ? ` · ${code.label}` : ''}`
      }
    >
      <div className="code-display">{code.alphanumeric}</div>
      {pngUrl ? (
        <img
          src={pngUrl}
          alt={`QR code for ${code.alphanumeric}`}
          className="qr-image"
        />
      ) : (
        <div className="qr-placeholder">{loading ? 'Generating QR…' : 'QR unavailable'}</div>
      )}
      <div className="info-list">
        <div className="info-item">
          <span className="key">Status</span>
          <span className="val">
            <Badge status={code.status} />
          </span>
        </div>
        {code.parentCode && (
          <div className="info-item">
            <span className="key">Parent code</span>
            <span className="val">{code.parentCode}</span>
          </div>
        )}
        <div className="info-item">
          <span className="key">Scans</span>
          <span className="val">{code.scans.toLocaleString()}</span>
        </div>
        <div className="info-item">
          <span className="key">Registrations</span>
          <span className="val">{code.registrations.toLocaleString()}</span>
        </div>
        {code.rewards > 0 && (
          <div className="info-item">
            <span className="key">Rewards</span>
            <span className="val">{code.rewards.toLocaleString()}</span>
          </div>
        )}
        {code.validTo && (
          <div className="info-item">
            <span className="key">Valid until</span>
            <span className="val">{code.validTo}</span>
          </div>
        )}
      </div>
      <div className="action-row">
        <PartnerCodePdfButton codeId={code.pdfDownloadCodeId ?? code.id} label="Download PDF" variant="primary" size="sm" />
        <DownloadButton href={pngUrl} label="Download PNG" variant="secondary" size="sm" />
        <DownloadButton href={svgUrl} label="Download SVG" variant="secondary" size="sm" />
      </div>
    </Card>
  )
}

export function Component() {
  const codeCentre = useLoaderData() as PartnerCodeCentreData
  const fetcher = useFetcher<SubCodeActionResult>()
  const [showSubCodeForm, setShowSubCodeForm] = useState(false)

  const isSubmitting = fetcher.state !== 'idle'
  const actionError = fetcher.data?.ok === false ? fetcher.data.error : null
  const actionSuccess = fetcher.data?.ok === true

  return (
    <>
      <PageHeader
        title="Code Centre"
        description="Download QR artwork, manage sub-codes and monitor code status"
        actions={
          <>
            <PartnerCodePdfButton
              codeId={codeCentre.primaryPdfDownloadCodeId}
              label="Download flyer (PDF)"
              variant="secondary"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowSubCodeForm(true)}
            >
              Request sub-code
            </button>
          </>
        }
      />

      {codeCentre.codes.length === 0 ? (
        <Card title="No codes yet">
          <p className="text-muted">
            Your partner codes will appear here once they are issued. You can request a sub-code for a branch or campaign.
          </p>
        </Card>
      ) : (
        <div className="grid-2">
          {codeCentre.codes.map((code) => (
            <PartnerCodeCard key={code.id} code={code} />
          ))}
        </div>
      )}

      <Card title="Print Collateral">
        <p className="text-muted">
          Bilingual (English / Arabic) artwork available for table tents, menus, receipts and window decals.
        </p>
        {codeCentre.collateral.length === 0 ? (
          <p className="text-muted">Collateral downloads will appear here when available.</p>
        ) : (
          <div className="action-row action-row--start">
            {codeCentre.collateral.map((item) => (
              <PartnerCollateralPdfButton key={item.id} item={item} />
            ))}
          </div>
        )}
      </Card>

      {showSubCodeForm && (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowSubCodeForm(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sub-code-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="sub-code-title">Request sub-code</h2>
            <p className="text-muted">
              Create a branch or campaign sub-code linked to your primary partner code.
            </p>

            {actionError && (
              <div className="login-error" role="alert">
                {actionError}
              </div>
            )}

            {actionSuccess && (
              <div className="form-success" role="status">
                Sub-code request submitted. Your codes list will refresh shortly.
              </div>
            )}

            <fetcher.Form method="post" className="sub-code-form">
              <input type="hidden" name="intent" value="request-sub-code" />
              <div className="form-group">
                <label htmlFor="sub-code-label">Label</label>
                <input
                  id="sub-code-label"
                  name="label"
                  type="text"
                  className="form-input"
                  placeholder="BR2"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sub-code-branch">Branch ID (optional)</label>
                <input
                  id="sub-code-branch"
                  name="branch_id"
                  type="text"
                  className="form-input"
                  placeholder="Branch UUID"
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sub-code-notes">Notes (optional)</label>
                <textarea
                  id="sub-code-notes"
                  name="notes"
                  className="form-input"
                  placeholder="Downtown branch"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div className="action-row action-row--start">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit request'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSubCodeForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}
    </>
  )
}
