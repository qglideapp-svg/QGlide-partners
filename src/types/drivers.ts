export type DriverMatchStatusFilter = 'pending' | 'matched' | 'rejected' | 'duplicate'

export interface PartnerDriverEarnings {
  grossQar: number
  commissionQar: number
  netQar: number
}

export interface PartnerDriverItem {
  id: string
  fullName: string
  phoneMasked: string
  vehicleLabel: string
  matchStatusLabel: string
  matchStatusDetail?: string
  trips: number
  earnings: PartnerDriverEarnings
  licenseExpiry: string
}

export interface PartnerDriversSummary {
  activeDrivers: number
  pendingMatch: number
  matchedDrivers: number
  totalTrips: number
  netDriverEarningsQar: number
}

export interface PartnerDriversData {
  summary: PartnerDriversSummary
  drivers: PartnerDriverItem[]
  totalCount: number
  page: number
  limit: number
}

export interface PartnerDriverUploadRow {
  full_name: string
  phone: string
  license_number: string
  license_expiry: string
  vehicle_make: string
  vehicle_model: string
  vehicle_plate: string
}

export interface PartnerDriverUploadInput {
  filename: string
  rows: PartnerDriverUploadRow[]
}

export interface PartnerDriversQuery {
  page?: number
  limit?: number
  search?: string
  match_status?: DriverMatchStatusFilter
}

export type DriversPageLoaderData =
  | { mode: 'live'; data: PartnerDriversData }
  | { mode: 'unsupported'; partnerCategory: string }
  | { mode: 'error'; error: string }
