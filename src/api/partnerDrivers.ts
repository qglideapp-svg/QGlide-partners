import { partnerDownload, partnerGet, partnerPost } from './client'
import type {
  PartnerDriverItem,
  PartnerDriversData,
  PartnerDriversQuery,
  PartnerDriversSummary,
  PartnerDriverUploadInput,
} from '../types/drivers'
import { triggerBrowserDownload } from '../utils/downloadBlob'

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function pickRecord(source: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  for (const key of keys) {
    const value = source[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
  }
  return source
}

function normalizeDriver(raw: unknown, index: number): PartnerDriverItem {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const vehicle = pickRecord(item, ['vehicle'])
  const earnings = pickRecord(item, ['earnings'])

  return {
    id: String(item.id ?? `driver-${index}`),
    fullName: String(item.full_name ?? item.fullName ?? item.name ?? 'Unknown driver'),
    phoneMasked: String(item.phone_masked ?? item.phoneMasked ?? item.phone ?? ''),
    vehicleLabel: String(
      vehicle.label ?? item.vehicle_label ?? item.vehicleLabel ?? item.vehicle ?? '',
    ),
    matchStatusLabel: String(
      item.match_status_label ?? item.matchStatusLabel ?? item.status_label ?? 'Unknown',
    ),
    matchStatusDetail: String(item.match_status_detail ?? item.matchStatusDetail ?? '').trim() || undefined,
    trips: toNumber(item.trips),
    earnings: {
      grossQar: toNumber(earnings.gross_qar ?? earnings.grossQar ?? item.gross_qar),
      commissionQar: toNumber(earnings.commission_qar ?? earnings.commissionQar ?? item.commission_qar),
      netQar: toNumber(earnings.net_qar ?? earnings.netQar ?? item.net_qar),
    },
    licenseExpiry: String(item.license_expiry ?? item.licenseExpiry ?? item.licence_expiry ?? ''),
  }
}

function normalizeSummary(raw: Record<string, unknown>): PartnerDriversSummary {
  const source = pickRecord(raw, ['summary'])

  return {
    activeDrivers: toNumber(source.active_drivers ?? source.activeDrivers),
    pendingMatch: toNumber(source.pending_match ?? source.pendingMatch),
    matchedDrivers: toNumber(source.matched_drivers ?? source.matchedDrivers),
    totalTrips: toNumber(source.total_trips ?? source.totalTrips),
    netDriverEarningsQar: toNumber(
      source.net_driver_earnings_qar ?? source.netDriverEarningsQar,
    ),
  }
}

function normalizeDriversList(raw: unknown): PartnerDriversData {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const drivers = Array.isArray(data.drivers) ? data.drivers : []

  return {
    summary: normalizeSummary(data),
    drivers: drivers.map(normalizeDriver),
    totalCount: toNumber(data.total_count ?? data.totalCount ?? drivers.length),
    page: toNumber(data.page) || 1,
    limit: toNumber(data.limit) || drivers.length || 50,
  }
}

const CSV_HEADER_ALIASES: Record<keyof PartnerDriverUploadInput['rows'][number], string[]> = {
  full_name: ['full_name', 'name', 'driver_name', 'driver'],
  phone: ['phone', 'phone_number', 'mobile', 'contact'],
  license_number: ['license_number', 'licence_number', 'license', 'licence', 'dl_number'],
  license_expiry: ['license_expiry', 'licence_expiry', 'expiry', 'license_exp'],
  vehicle_make: ['vehicle_make', 'make', 'car_make'],
  vehicle_model: ['vehicle_model', 'model', 'car_model'],
  vehicle_plate: ['vehicle_plate', 'plate', 'registration', 'reg_plate'],
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_')
}

function rowValue(row: Record<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    const value = row[alias]
    if (value?.trim()) return value.trim()
  }
  return ''
}

export function parseDriverUploadCsv(text: string): PartnerDriverUploadInput['rows'] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map(normalizeHeader)
  const rows: PartnerDriverUploadInput['rows'] = []

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line)
    if (values.every((value) => !value.trim())) continue

    const source: Record<string, string> = {}
    headers.forEach((header, index) => {
      source[header] = values[index]?.trim() ?? ''
    })

    const row = {
      full_name: rowValue(source, CSV_HEADER_ALIASES.full_name),
      phone: rowValue(source, CSV_HEADER_ALIASES.phone),
      license_number: rowValue(source, CSV_HEADER_ALIASES.license_number),
      license_expiry: rowValue(source, CSV_HEADER_ALIASES.license_expiry),
      vehicle_make: rowValue(source, CSV_HEADER_ALIASES.vehicle_make),
      vehicle_model: rowValue(source, CSV_HEADER_ALIASES.vehicle_model),
      vehicle_plate: rowValue(source, CSV_HEADER_ALIASES.vehicle_plate),
    }

    if (row.full_name && row.phone) {
      rows.push(row)
    }
  }

  return rows
}

export async function fetchPartnerDrivers(
  accessToken: string,
  query: PartnerDriversQuery = {},
): Promise<{ success: true; data: PartnerDriversData } | { success: false; error: string }> {
  const result = await partnerGet<unknown>('partner-drivers', accessToken, {
    page: query.page,
    limit: query.limit,
    search: query.search?.trim() || undefined,
    match_status: query.match_status,
    driver_id: undefined,
  })

  if (!result.success) {
    return result
  }

  return {
    success: true,
    data: normalizeDriversList(result.data),
  }
}

export async function fetchPartnerDriver(
  accessToken: string,
  driverId: string,
): Promise<{ success: true; data: PartnerDriverItem } | { success: false; error: string }> {
  const result = await partnerGet<unknown>('partner-drivers', accessToken, {
    driver_id: driverId,
  })

  if (!result.success) {
    return result
  }

  const payload = (result.data && typeof result.data === 'object' ? result.data : {}) as Record<
    string,
    unknown
  >
  const driverRaw = payload.driver ?? payload.drivers ?? result.data

  if (Array.isArray(driverRaw)) {
    const [first] = driverRaw
    if (!first) {
      return { success: false, error: 'Driver not found.' }
    }
    return { success: true, data: normalizeDriver(first, 0) }
  }

  return {
    success: true,
    data: normalizeDriver(driverRaw, 0),
  }
}

export async function uploadPartnerDriverRoster(
  accessToken: string,
  input: PartnerDriverUploadInput,
): Promise<{ success: true } | { success: false; error: string }> {
  const result = await partnerPost<unknown>('partner-driver-upload', accessToken, input)

  if (!result.success) {
    return result
  }

  return { success: true }
}

export async function downloadPartnerDriversExport(
  accessToken: string,
  query: Pick<PartnerDriversQuery, 'search' | 'match_status'> = {},
): Promise<{ success: true } | { success: false; error: string }> {
  const result = await partnerDownload(
    'partner-drivers-export',
    accessToken,
    {
      search: query.search?.trim() || undefined,
      match_status: query.match_status,
    },
    'driver-roster.csv',
  )

  if (!result.success) {
    return result
  }

  triggerBrowserDownload(result.blob, result.filename)
  return { success: true }
}

export function driverBadgeStatus(label: string): string {
  switch (label.trim().toLowerCase()) {
    case 'active':
      return 'active'
    case 'uploaded':
      return 'uploaded'
    case 'registered':
      return 'registered'
    case 'inactive':
      return 'inactive'
    default:
      return label.trim().toLowerCase().replace(/\s+/g, '_') || 'neutral'
  }
}
