import { parseContentDispositionFilename } from '../utils/downloadBlob'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export interface ApiFailure {
  success: false
  error: string
}

export function getPartnerAuthHeaders(accessToken: string): HeadersInit {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
  }
}

const PROXY_DOWNLOAD_PATHS: Record<string, string> = {
  'partner-code-pdf': '/api/partner-code-pdf',
  'partner-collateral-pdf': '/api/partner-collateral-pdf',
}

function buildPartnerDownloadUrl(
  path: string,
  searchParams?: Record<string, string | undefined>,
): string {
  const proxyPath = typeof window !== 'undefined' ? PROXY_DOWNLOAD_PATHS[path] : undefined
  const url = proxyPath
    ? new URL(proxyPath, window.location.origin)
    : new URL(`${supabaseUrl}/functions/v1/${path}`)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) continue

      if (proxyPath && path === 'partner-collateral-pdf' && key === 'template') {
        url.searchParams.set('collateral_template', value)
        continue
      }

      url.searchParams.set(key, value)
    }
  }

  return url.toString()
}

export async function partnerDownload(
  path: string,
  accessToken: string,
  searchParams?: Record<string, string | undefined>,
  fallbackFilename = 'download',
): Promise<
  { success: true; blob: Blob; filename: string } | ApiFailure
> {
  const url = buildPartnerDownloadUrl(path, searchParams)

  let response: Response

  try {
    response = await fetch(url, {
      headers: getPartnerAuthHeaders(accessToken),
    })
  } catch {
    return {
      success: false,
      error: 'Network error while downloading. Please try again.',
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      try {
        const payload = (await response.json()) as ApiFailure | { success: true }
        if (payload.success === false) {
          return payload
        }
      } catch {
        return {
          success: false,
          error: 'Unable to download file. Please try again.',
        }
      }
    }

    return {
      success: false,
      error: 'Unable to download file. Please try again.',
    }
  }

  let blob: Blob

  try {
    blob = await response.blob()
  } catch {
    return {
      success: false,
      error: 'Unable to read the downloaded file. Please try again.',
    }
  }

  if (blob.type.includes('json')) {
    try {
      const payload = JSON.parse(await blob.text()) as ApiFailure | { success: true }
      if (payload.success === false) {
        return payload
      }
    } catch {
      return {
        success: false,
        error: 'Unexpected download response from server.',
      }
    }
  }

  const filename =
    parseContentDispositionFilename(response.headers.get('content-disposition')) ||
    fallbackFilename

  return { success: true, blob, filename }
}

export async function partnerGet<TData>(
  path: string,
  accessToken: string,
  searchParams?: Record<string, string | number | undefined>,
): Promise<{ success: true; data: TData } | ApiFailure> {
  if (!supabaseUrl) {
    return {
      success: false,
      error: 'Partner API is not configured.',
    }
  }

  const url = new URL(`${supabaseUrl}/functions/v1/${path}`)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  let response: Response

  try {
    response = await fetch(url.toString(), {
      headers: getPartnerAuthHeaders(accessToken),
    })
  } catch {
    return {
      success: false,
      error: 'Network error while loading data. Please try again.',
    }
  }

  let payload: { success: true; data: TData } | ApiFailure

  try {
    payload = (await response.json()) as { success: true; data: TData } | ApiFailure
  } catch {
    return {
      success: false,
      error: 'Unexpected response from server. Please try again.',
    }
  }

  if (!response.ok && payload.success !== false) {
    return {
      success: false,
      error: 'Unable to load data. Please try again.',
    }
  }

  return payload
}

export async function partnerPost<TData>(
  path: string,
  accessToken: string | null,
  body: unknown,
  searchParams?: Record<string, string | number | undefined>,
): Promise<{ success: true; data: TData } | ApiFailure> {
  if (!supabaseUrl) {
    return {
      success: false,
      error: 'Partner API is not configured.',
    }
  }

  const url = new URL(`${supabaseUrl}/functions/v1/${path}`)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    apikey: anonKey,
    Authorization: `Bearer ${accessToken ?? anonKey}`,
  }

  let response: Response

  try {
    response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  } catch {
    return {
      success: false,
      error: 'Network error while completing request. Please try again.',
    }
  }

  let payload: { success: true; data: TData } | ApiFailure

  try {
    payload = (await response.json()) as { success: true; data: TData } | ApiFailure
  } catch {
    return {
      success: false,
      error: 'Unexpected response from server. Please try again.',
    }
  }

  if (!response.ok && payload.success !== false) {
    return {
      success: false,
      error: 'Unable to complete request. Please try again.',
    }
  }

  return payload
}
