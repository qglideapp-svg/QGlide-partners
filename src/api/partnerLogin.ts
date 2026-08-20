import type { PartnerLoginResponse } from '../types/auth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function getPartnerLoginUrl(): string {
  if (typeof window !== 'undefined') {
    return new URL('/api/partner-login', window.location.origin).toString()
  }

  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is not configured')
  }

  return `${supabaseUrl}/functions/v1/partner-login`
}

export async function partnerLogin(email: string, password: string): Promise<PartnerLoginResponse> {
  const url = getPartnerLoginUrl()
  const usesDirectSupabase = url.includes('/functions/v1/')

  if (usesDirectSupabase && (!supabaseUrl || !anonKey)) {
    return {
      success: false,
      error: 'Sign-in is not configured. Please contact support.',
    }
  }

  let response: Response

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(usesDirectSupabase
          ? {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
            }
          : {}),
      },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    return {
      success: false,
      error: 'Unable to sign in. Please check your connection and try again.',
    }
  }

  let payload: PartnerLoginResponse

  try {
    payload = (await response.json()) as PartnerLoginResponse
  } catch {
    return {
      success: false,
      error: 'Unexpected response from sign-in service. Please try again.',
    }
  }

  if (!response.ok && payload.success !== false) {
    return {
      success: false,
      error: 'Unable to sign in. Please try again.',
    }
  }

  return payload
}
