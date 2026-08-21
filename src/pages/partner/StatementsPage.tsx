import { useState } from 'react'
import { useLoaderData, useNavigate, useRevalidator } from 'react-router-dom'
import { StatementsSkeleton } from '../../components/skeletons/PartnerPageSkeletons'
import { downloadPartnerStatement, fetchPartnerStatements } from '../../api/partnerStatements'
import { Badge, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { clearSession } from '../../lib/authStorage'
import { handlePartnerApiFailure, requirePartnerSession } from '../../lib/partnerLoader'
import type { StatementArchiveItem, StatementsPageLoaderData } from '../../types/statements'

export async function loader(): Promise<StatementsPageLoaderData> {
  const session = requirePartnerSession()
  const result = await fetchPartnerStatements(session.access_token, 24)

  if (!result.success) {
    if (/token/i.test(result.error)) {
      handlePartnerApiFailure(result.error)
    }

    return { mode: 'error', error: result.error }
  }

  return { mode: 'live', data: result.data }
}

export function HydrateFallback() {
  return <StatementsSkeleton />
}

function StatementDownloadButton({
  statement,
  format,
  label,
}: {
  statement: StatementArchiveItem
  format: 'pdf' | 'xlsx'
  label: string
}) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    if (!session?.access_token || downloading) return

    setDownloading(true)
    setError(null)

    try {
      const result = await downloadPartnerStatement(session.access_token, statement.id, format)

      if (!result.success) {
        if (/token/i.test(result.error)) {
          clearSession()
          navigate('/login')
          return
        }
        setError(result.error)
      }
    } catch {
      setError('Unable to download statement. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => void handleDownload()}
        disabled={!session?.access_token || downloading}
      >
        {downloading ? '…' : label}
      </button>
      {error && (
        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', marginTop: 4 }}>
          {error}
        </span>
      )}
    </>
  )
}

export function Component() {
  const loaderData = useLoaderData() as StatementsPageLoaderData
  const revalidator = useRevalidator()

  if (loaderData.mode === 'error') {
    return (
      <>
        <PageHeader
          title="Statement Archive"
          description="Downloadable period statements in PDF and Excel"
        />
        <div className="card">
          <div className="card-body empty-state">
            <p>Unable to load statements.</p>
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

  const { statements } = loaderData.data

  return (
    <>
      <PageHeader
        title="Statement Archive"
        description="Downloadable period statements in PDF and Excel"
      />

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {statements.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No statements are available yet.</p>
              <p className="text-muted mt-16">
                Period statements appear here once they are generated and approved.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Net amount</th>
                    <th>Generated</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map((statement) => (
                    <tr key={statement.id}>
                      <td>
                        <strong>{statement.periodLabel}</strong>
                        {statement.redemptionsCount > 0 && (
                          <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
                            {statement.redemptionsCount.toLocaleString()} redemptions
                          </div>
                        )}
                      </td>
                      <td>{statement.netAmountLabel}</td>
                      <td>{statement.generatedAt || '—'}</td>
                      <td>
                        <Badge status={statement.status} label={statement.statusLabel} />
                      </td>
                      <td>
                        <StatementDownloadButton statement={statement} format="pdf" label="PDF" />{' '}
                        <StatementDownloadButton statement={statement} format="xlsx" label="Excel" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
