import logo from '../../assets/logo.png'

export function ClaimLandingPage() {
  return (
    <div className="public-page">
      <header className="public-header">
        <img src={logo} alt="QGlide" />
        <span>Your reward</span>
      </header>
      <div className="public-body">
        <div className="public-card">
          <div className="reward-banner">Milestone reached · Tier 1</div>

          <h1>QAR 75 meal credit</h1>
          <p className="lede">Earned at Al Fanar Restaurant</p>

          <div className="venue-info">
            <p><strong>Al Fanar Restaurant</strong></p>
            <p>Souq Waqif, Doha, Qatar</p>
            <p>Open daily 11:00 – 23:00</p>
            <p className="text-muted">~2.4 km from your location</p>
          </div>

          <div className="voucher-qr">Scan to redeem</div>
          <div className="code-display" style={{ fontSize: '0.9375rem' }}>QGV-2026-00891</div>
          <p className="text-muted" style={{ fontSize: '0.75rem' }}>
            Expires 5 September 2026 · Single use
          </p>

          <div className="action-row">
            <button type="button" className="btn btn-primary">Get directions</button>
            <button type="button" className="btn btn-secondary">Call venue</button>
            <button type="button" className="btn btn-ghost">Book a ride</button>
          </div>

          <p className="text-muted mt-16" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
            Present this at the venue. After redemption, your counter resets — next reward at 9 completed trips.
          </p>
        </div>
      </div>
    </div>
  )
}
