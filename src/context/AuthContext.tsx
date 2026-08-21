import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { partnerLogin } from '../api/partnerLogin'
import { partnerLogout } from '../api/partnerLogout'
import { clearSession, loadSession, saveSession } from '../lib/authStorage'
import type { PartnerSession } from '../types/auth'

interface AuthContextValue {
  session: PartnerSession | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PartnerSession | null>(() => loadSession())

  const login = useCallback(async (email: string, password: string) => {
    const result = await partnerLogin(email, password)

    if (!result.success) {
      return result.error
    }

    saveSession(result.data)
    setSession(result.data)
    return null
  }, [])

  const logout = useCallback(async () => {
    const currentSession = loadSession()

    if (currentSession?.access_token) {
      try {
        await partnerLogout(currentSession.access_token)
      } catch {
        // Still clear local session if the network request fails.
      }
    }

    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
