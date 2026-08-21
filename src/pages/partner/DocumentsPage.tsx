import { useState } from 'react'
import { useLoaderData, useNavigate, useRevalidator } from 'react-router-dom'
import { DocumentsSkeleton } from '../../components/skeletons/PartnerPageSkeletons'
import { downloadPartnerDocument, fetchPartnerDocuments } from '../../api/partnerDocuments'
import { Badge, Card, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { clearSession } from '../../lib/authStorage'
import { handlePartnerApiFailure, requirePartnerSession } from '../../lib/partnerLoader'
import type { DocumentsPageLoaderData, PartnerDocumentItem } from '../../types/documents'

export async function loader(): Promise<DocumentsPageLoaderData> {
  const session = requirePartnerSession()
  const result = await fetchPartnerDocuments(session.access_token)

  if (!result.success) {
    if (/token/i.test(result.error)) {
      handlePartnerApiFailure(result.error)
    }

    return { mode: 'error', error: result.error }
  }

  return { mode: 'live', data: result.data }
}

export function HydrateFallback() {
  return <DocumentsSkeleton />
}

function DocumentDownloadButton({ document }: { document: PartnerDocumentItem }) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    if (!session?.access_token || downloading || !document.downloadable) return

    setDownloading(true)
    setError(null)

    try {
      const result = await downloadPartnerDocument(session.access_token, document)

      if (!result.success) {
        if (/token/i.test(result.error)) {
          clearSession()
          navigate('/login')
          return
        }
        setError(result.error)
      }
    } catch {
      setError('Unable to download document. Please try again.')
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
        disabled={!session?.access_token || downloading || !document.downloadable}
      >
        {downloading ? '…' : 'Download'}
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
  const loaderData = useLoaderData() as DocumentsPageLoaderData
  const revalidator = useRevalidator()

  if (loaderData.mode === 'error') {
    return (
      <>
        <PageHeader
          title="Document Centre"
          description="Agreements, licences and compliance items"
        />
        <div className="card">
          <div className="card-body empty-state">
            <p>Unable to load documents.</p>
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

  const { title, subtitle, checklist, documents } = loaderData.data

  return (
    <>
      <PageHeader title={title} description={subtitle} />

      <Card title="Compliance Checklist">
        {checklist.length === 0 ? (
          <p className="text-muted">No checklist items are available yet.</p>
        ) : (
          checklist.map((item) => (
            <div className="metric-row" key={item.id}>
              <span>{item.label}</span>
              <Badge status={item.status} label={item.statusLabel} />
            </div>
          ))
        )}
      </Card>

      <div className="card mt-24">
        <div className="card-body" style={{ padding: 0 }}>
          {documents.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No documents are available yet.</p>
              <p className="text-muted mt-16">
                Uploaded agreements and compliance files will appear here when ready.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <strong>{document.title}</strong>
                        {document.generatedAt && (
                          <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
                            Generated {document.generatedAt}
                          </div>
                        )}
                      </td>
                      <td>{document.fileType}</td>
                      <td>{document.expiresAt || '—'}</td>
                      <td>
                        <Badge status={document.status} label={document.statusLabel} />
                      </td>
                      <td>
                        <DocumentDownloadButton document={document} />
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
