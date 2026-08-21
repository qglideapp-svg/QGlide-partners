export function normalizePartnerPath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/partner'
}

export function partnerLoadingLabel(pathname: string): string {
  const path = normalizePartnerPath(pathname)

  const labels: Record<string, string> = {
    '/partner': 'Loading dashboard…',
    '/partner/codes': 'Loading code centre…',
    '/partner/drivers': 'Loading drivers…',
    '/partner/earnings': 'Loading earnings…',
    '/partner/redemption': 'Loading redemption console…',
    '/partner/statements': 'Loading statements…',
    '/partner/documents': 'Loading documents…',
    '/partner/support': 'Loading support…',
  }

  return labels[path] ?? 'Loading…'
}

export function partnerPathsMatch(a: string, b: string): boolean {
  return normalizePartnerPath(a) === normalizePartnerPath(b)
}
