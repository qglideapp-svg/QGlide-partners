import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

export function PartnerPageError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? error.statusText || `Error ${error.status}`
    : error instanceof Error
      ? error.message
      : 'Something went wrong while loading this page.'

  return (
    <div className="card">
      <div className="card-body empty-state">
        <h2 style={{ marginBottom: 8 }}>Unable to load page</h2>
        <p className="text-muted">{message}</p>
        <button
          type="button"
          className="btn btn-primary mt-16"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </div>
    </div>
  )
}
