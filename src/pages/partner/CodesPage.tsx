import { codes } from '../../data/mockData'
import { Badge, Card, PageHeader } from '../../components/ui'

const partnerCodes = codes.filter((c) => c.partnerId === 'p2')

export function PartnerCodesPage() {
  return (
    <>
      <PageHeader
        title="Code Centre"
        description="Download QR artwork, manage sub-codes and monitor code status"
        actions={
          <>
            <button className="btn btn-secondary">Download flyer (PDF)</button>
            <button className="btn btn-primary">Request sub-code</button>
          </>
        }
      />

      <div className="grid-2">
        {partnerCodes.map((c) => (
          <Card key={c.id} title={c.type === 'primary' ? 'Primary Code' : 'Sub-code'}>
            <div className="code-display">{c.alphanumeric}</div>
            <div className="qr-placeholder">QR code</div>
            <div className="info-list">
              <div className="info-item"><span className="key">Status</span><span className="val"><Badge status={c.status} /></span></div>
              <div className="info-item"><span className="key">Scans</span><span className="val">{c.scans.toLocaleString()}</span></div>
              <div className="info-item"><span className="key">Registrations</span><span className="val">{c.registrations.toLocaleString()}</span></div>
              <div className="info-item"><span className="key">Valid until</span><span className="val">{c.validTo}</span></div>
            </div>
            <div className="action-row">
              <button className="btn btn-primary btn-sm">Download PNG</button>
              <button className="btn btn-secondary btn-sm">Download SVG</button>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Print Collateral">
        <p className="text-muted">
          Bilingual (English / Arabic) artwork available for table tents, menus, receipts and window decals.
        </p>
        <div className="action-row" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-secondary">Table tent template</button>
          <button className="btn btn-secondary">Menu insert</button>
          <button className="btn btn-secondary">Window decal</button>
        </div>
      </Card>
    </>
  )
}
