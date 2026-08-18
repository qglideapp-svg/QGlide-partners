import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import animeVideo from '../assets/anime.mp4'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/partner" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const loginError = await login(email.trim(), password)
    setIsSubmitting(false)

    if (loginError) {
      setError(loginError)
      return
    }

    navigate('/partner')
  }

  return (
    <div className="login-page">
      <div className="login-bg-media" aria-hidden="true">
        <video
          className="login-bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src={animeVideo} type="video/mp4" />
        </video>
        <div className="login-bg-scrim" />
      </div>

      <div className="login-horizon" aria-hidden="true" />
      <div className="login-card">
        <div className="logo">
          <img src={logo} alt="QGlide" />
        </div>
        <p className="page-eyebrow">Partner portal</p>
        <h1>Sign in</h1>
        <p className="subtitle">
          View your code performance, earnings, and reward redemptions.
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@yourbusiness.qa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
