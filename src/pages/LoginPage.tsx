import { type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import animeVideo from '../assets/anime.mp4'

export function LoginPage() {
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
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
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@yourbusiness.qa"
              defaultValue="marketing@alfanar.qa"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              defaultValue="password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
