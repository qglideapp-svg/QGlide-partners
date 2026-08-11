import { Badge, Card, PageHeader } from '../../components/ui'

const tickets = [
  { id: '#442', subject: 'Attribution dispute — user u-2847', status: 'resolved', date: '2026-08-05' },
  { id: '#438', subject: 'Sub-code request for Lusail branch', status: 'active', date: '2026-07-28' },
]

export function PartnerSupportPage() {
  return (
    <>
      <PageHeader
        title="Support & Disputes"
        description="Raise tickets tied directly to your attribution records"
        actions={<button className="btn btn-primary">New ticket</button>}
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h2>Ticket History</h2></div>
          <div className="card-body" style={{ padding: 0 }}>
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
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.subject}</td>
                      <td>{t.date}</td>
                      <td><Badge status={t.status === 'active' ? 'open' : 'resolved'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Card title="Contact Support">
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input id="subject" className="form-input" placeholder="Describe your issue" />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" className="form-input" rows={4} placeholder="Include voucher numbers or user IDs if relevant" />
          </div>
          <button type="button" className="btn btn-primary">Submit ticket</button>
        </Card>
      </div>
    </>
  )
}
