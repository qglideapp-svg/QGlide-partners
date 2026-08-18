import type { PartnerLoginResponse } from '../types/auth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function partnerLogin(email: string, password: string): Promise<PartnerLoginResponse> {
  const response = await fetch(`${supabaseUrl}/functions/v1/partner-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ email, password }),
  })

  const payload = (await response.json()) as PartnerLoginResponse

  if (!response.ok && payload.success !== false) {
    return {
      success: false,
      error: 'Unable to sign in. Please try again.',
    }
  }

  return payload
}
