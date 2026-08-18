export interface PartnerCodeItem {
  id: string
  alphanumeric: string
  type: 'primary' | 'sub'
  label?: string
  parentCode?: string
  status: string
  scans: number
  registrations: number
  rewards: number
  validFrom?: string
  validTo?: string
  pdfDownloadCodeId?: string
  scanUrl?: string
  qrPngUrl?: string
  qrSvgUrl?: string
}

export interface CollateralItem {
  id: string
  label: string
  template: string
  description?: string
  url?: string
  type?: string
}

export interface PartnerCodeCentreData {
  codes: PartnerCodeItem[]
  collateral: CollateralItem[]
  primaryPdfDownloadCodeId?: string
  flyerPdfUrl?: string
}

export interface SubCodeRequestInput {
  label: string
  branch_id?: string
  notes?: string
}
