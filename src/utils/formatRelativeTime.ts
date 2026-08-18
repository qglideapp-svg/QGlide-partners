const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'Recently'

  const diffMs = Date.now() - date.getTime()
  if (diffMs < MINUTE) return 'Just now'
  if (diffMs < HOUR) {
    const minutes = Math.floor(diffMs / MINUTE)
    return `${minutes}m ago`
  }
  if (diffMs < DAY) {
    const hours = Math.floor(diffMs / HOUR)
    return `${hours}h ago`
  }
  if (diffMs < DAY * 2) return 'Yesterday'

  const days = Math.floor(diffMs / DAY)
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-QA', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}
