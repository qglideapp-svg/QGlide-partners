import { partnerPost } from './client'

export async function partnerLogout(
  accessToken: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const result = await partnerPost<unknown>('partner-logout', accessToken, {})

  if (!result.success) {
    return result
  }

  return { success: true }
}
