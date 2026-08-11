import { PageHeader } from '../../components/ui'

export function PartnerDriversPage() {
  return (
    <>
      <PageHeader
        title="Drivers"
        description="Fleet driver management is available for limousine partners"
      />
      <div className="card">
        <div className="card-body empty-state">
          <p>Your partner account (Restaurant) does not include fleet driver management.</p>
          <p className="text-muted mt-16">
            Limousine partners can upload driver rosters, track match status and view per-driver earnings here.
          </p>
        </div>
      </div>
    </>
  )
}
