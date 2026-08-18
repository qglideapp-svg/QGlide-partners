import { redirect } from 'react-router-dom'
import { clearSession, loadSession } from './authStorage'
import type { PartnerSession } from '../types/auth'

export function requirePartnerSession(): PartnerSession {
  const session = loadSession()

  if (!session?.access_token) {
    throw redirect('/login')
  }

  return session
}

export function handlePartnerApiFailure(error: string): never {
  if (/token/i.test(error)) {
    clearSession()
    throw redirect('/login')
  }

  throw new Response(error, { status: 502 })
}
