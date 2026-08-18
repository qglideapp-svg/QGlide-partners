export interface AuthUser {
  id: string
  email: string
  full_name: string
  user_type: string
}

export interface AuthPartner {
  id: string
  legal_name: string
  trading_name: string
  category: string
  status: string
  status_reason: string | null
  portal_user_id: string
  created_at: string
  updated_at: string
}

export interface PartnerSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
  partner: AuthPartner
}

export interface PartnerLoginSuccess {
  success: true
  data: PartnerSession
}

export interface PartnerLoginFailure {
  success: false
  error: string
}

export type PartnerLoginResponse = PartnerLoginSuccess | PartnerLoginFailure
