import { Badge, PageHeader } from '../../components/ui'

const statements = [
  { period: 'July 2026', amount: 'QAR 18,750', status: 'pending_approval', date: '2026-08-01' },
  { period: 'June 2026', amount: 'QAR 16,200', status: 'paid', date: '2026-07-01' },
  { period: 'May 2026', amount: 'QAR 14,850', status: 'paid', date: '2026-06-01' },
]

export function PartnerStatementsPage() {
  return (
    <>
      <PageHeader
        title="Statement Archive"
        description="Downloadable period statements in PDF and Excel"
      />

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
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
                {statements.map((s) => (
                  <tr key={s.period}>
                    <td><strong>{s.period}</strong></td>
                    <td>{s.amount}</td>
                    <td>{s.date}</td>
                    <td><Badge status={s.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm">PDF</button>{' '}
                      <button className="btn btn-secondary btn-sm">Excel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
