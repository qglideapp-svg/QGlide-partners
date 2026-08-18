export function getPartnerScanUrl(alphanumeric: string, scanUrl?: string): string {
  if (scanUrl?.trim()) {
    return scanUrl.trim()
  }

  const configuredBase = import.meta.env.VITE_SCAN_BASE_URL?.replace(/\/$/, '')
  const base =
    configuredBase ?? (typeof window !== 'undefined' ? window.location.origin : '')

  return `${base}/scan/${encodeURIComponent(alphanumeric)}`
}
