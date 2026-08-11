import { Badge, PageHeader } from '../../components/ui'

const staff = [
  { name: 'Ahmed Al-Mansouri', email: 'ahmed@alfanar.qa', role: 'Partner Administrator', status: 'active' },
  { name: 'Layla Mohammed', email: 'layla@alfanar.qa', role: 'Staff / Redeemer', status: 'active' },
  { name: 'Omar Farouk', email: 'omar@alfanar.qa', role: 'Staff / Redeemer', status: 'active' },
]

export function PartnerUsersPage() {
  return (
    <>
      <PageHeader
        title="User Management"
        description="Create staff accounts with limited redemption access"
        actions={<button className="btn btn-primary">Add staff user</button>}
      />

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((u) => (
                  <tr key={u.email}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td><Badge status={u.status} /></td>
                    <td><button className="btn btn-secondary btn-sm">Edit</button></td>
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
