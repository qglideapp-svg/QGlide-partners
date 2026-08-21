import type { CSSProperties, ReactNode } from 'react'

interface SkeletonBoneProps {
  className?: string
  style?: CSSProperties
}

export function SkeletonBone({ className = '', style }: SkeletonBoneProps) {
  return <div className={`skeleton-bone ${className}`.trim()} style={style} aria-hidden="true" />
}

export function SkeletonPageHeader({
  eyebrow = false,
  actions = false,
}: {
  eyebrow?: boolean
  actions?: boolean
}) {
  return (
    <div className="page-header">
      <div className="page-header-row">
        <div className="skeleton-page-header-copy">
          {eyebrow && <SkeletonBone className="skeleton-eyebrow" />}
          <SkeletonBone className="skeleton-title" />
          <SkeletonBone className="skeleton-desc" />
        </div>
        {actions && (
          <div className="page-actions skeleton-page-actions">
            <SkeletonBone className="skeleton-button" />
            <SkeletonBone className="skeleton-button skeleton-button--primary" />
          </div>
        )}
      </div>
    </div>
  )
}

export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="stat-grid skeleton-stat-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="stat-card">
          <SkeletonBone className="skeleton-stat-label" />
          <SkeletonBone className="skeleton-stat-value" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard({
  title = true,
  lines = 3,
  children,
}: {
  title?: boolean
  lines?: number
  children?: ReactNode
}) {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      {title && (
        <div className="card-header">
          <SkeletonBone className="skeleton-card-title" />
        </div>
      )}
      <div className="card-body">
        {children ??
          Array.from({ length: lines }, (_, index) => (
            <SkeletonBone key={index} className="skeleton-line" style={{ width: `${88 - index * 8}%` }} />
          ))}
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="card-body" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table skeleton-table">
            <thead>
              <tr>
                {Array.from({ length: columns }, (_, index) => (
                  <th key={index}>
                    <SkeletonBone className="skeleton-table-head" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: columns }, (_, colIndex) => (
                    <td key={colIndex}>
                      <SkeletonBone
                        className="skeleton-table-cell"
                        style={{ width: colIndex === 0 ? '72%' : '56%' }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function SkeletonFunnel({ steps = 6 }: { steps?: number }) {
  return (
    <div className="funnel-steps skeleton-funnel" aria-hidden="true">
      {Array.from({ length: steps }, (_, index) => (
        <div key={index} className="funnel-step">
          <SkeletonBone className="skeleton-funnel-count" />
          <SkeletonBone className="skeleton-funnel-name" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonMetricRows({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="metric-row">
          <SkeletonBone className="skeleton-line" style={{ width: '48%' }} />
          <SkeletonBone className="skeleton-line skeleton-line--short" />
        </div>
      ))}
    </>
  )
}

export function SkeletonGrid2({ children }: { children: ReactNode }) {
  return <div className="grid-2 skeleton-grid-2">{children}</div>
}

export function SkeletonFormCard({ fields = 3 }: { fields?: number }) {
  return (
    <SkeletonCard title>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="skeleton-form-field">
          <SkeletonBone className="skeleton-form-label" />
          <SkeletonBone className="skeleton-form-input" />
        </div>
      ))}
      <SkeletonBone className="skeleton-button skeleton-button--block" />
    </SkeletonCard>
  )
}
