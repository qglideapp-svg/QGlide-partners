import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

export function ScanLandingPage() {
  return (
    <div className="public-page">
      <header className="public-header">
        <img src={logo} alt="QGlide" />
        <span>Partner offer</span>
      </header>
      <div className="public-body">
        <div className="public-card">
          <span className="page-eyebrow" style={{ display: 'block', marginBottom: 10 }}>Restaurant partner</span>
          <h1>Al Fanar Restaurant</h1>
          <p className="lede">Download QGlide and earn a meal on us.</p>

          <div className="code-display">QG-RST-9F4KD</div>

          <p className="threshold-note">
            Complete <strong>3 trips</strong> as a rider or <strong>6 trips</strong> as a driver
            to unlock your reward. Only trips after you scan count — forward-only attribution.
          </p>

          <div className="action-row">
            <a
              href="https://apps.apple.com/us/app/qglide/id6762509081"
              className="btn btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.alphatecks.qglide"
              className="btn btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              Google Play
            </a>
          </div>

          <p className="text-muted mt-16" style={{ fontSize: '0.8125rem' }}>
            Already have QGlide?{' '}
            <Link to="/claim/demo">Open your reward</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
