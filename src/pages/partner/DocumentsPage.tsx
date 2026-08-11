import { Badge, Card, PageHeader } from '../../components/ui'

const documents = [
  { name: 'Partnership Agreement', type: 'PDF', expiry: '2026-12-31', status: 'active' },
  { name: 'Trade Licence', type: 'PDF', expiry: '2027-02-15', status: 'active' },
  { name: 'Bank Details Form', type: 'PDF', expiry: '—', status: 'active' },
  { name: 'Meal Payment Agreement', type: 'PDF', expiry: '2026-12-31', status: 'active' },
]

export function PartnerDocumentsPage() {
  return (
    <>
      <PageHeader
        title="Document Centre"
        description="Agreements, licences and compliance items"
      />

      <Card title="Compliance Checklist">
        <div className="metric-row">
          <span>Partnership agreement signed</span>
          <Badge status="active" label="Complete" />
        </div>
        <div className="metric-row">
          <span>Trade licence uploaded</span>
          <Badge status="active" label="Complete" />
        </div>
        <div className="metric-row">
          <span>Bank details verified</span>
          <Badge status="active" label="Complete" />
        </div>
        <div className="metric-row">
          <span>Commercial terms configured</span>
          <Badge status="active" label="Complete" />
        </div>
      </Card>

      <div className="card mt-24">
        <div className="card-body" style={{ padding: 0 }}>
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
                {documents.map((d) => (
                  <tr key={d.name}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.type}</td>
                    <td>{d.expiry}</td>
                    <td><Badge status={d.status} /></td>
                    <td><button className="btn btn-secondary btn-sm">Download</button></td>
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
