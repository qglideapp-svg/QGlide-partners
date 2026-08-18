import { partnerDownload, partnerGet, partnerPost } from './client'
import type {
  CollateralItem,
  PartnerCodeCentreData,
  PartnerCodeItem,
  SubCodeRequestInput,
} from '../types/codeCentre'
import { triggerBrowserDownload } from '../utils/downloadBlob'

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function normalizeQrAsset(value: unknown): string | undefined {
  const raw = toOptionalString(value)
  if (!raw) return undefined
  if (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('/')) {
    return raw
  }

  return `data:image/png;base64,${raw}`
}

function readQrAssets(item: Record<string, unknown>) {
  const nestedQr =
    item.qr && typeof item.qr === 'object' ? (item.qr as Record<string, unknown>) : null

  return {
    qrPngUrl: normalizeQrAsset(
      item.qr_png_url ??
        item.qr_png ??
        item.png_url ??
        item.qr_code_png_url ??
        item.qrCodePngUrl ??
        item.qr_image_url ??
        item.qr_url ??
        nestedQr?.png_url ??
        nestedQr?.png ??
        nestedQr?.url,
    ),
    qrSvgUrl: toOptionalString(
      item.qr_svg_url ??
        item.qr_svg ??
        item.svg_url ??
        item.qr_code_svg_url ??
        item.qrCodeSvgUrl ??
        nestedQr?.svg_url ??
        nestedQr?.svg,
    ),
    scanUrl: toOptionalString(
      item.qr_payload_url ??
        item.scan_url ??
        item.scanUrl ??
        item.landing_url ??
        item.landingUrl ??
        item.qr_target_url ??
        item.qrTargetUrl ??
        nestedQr?.target_url ??
        nestedQr?.scan_url,
    ),
  }
}

function readPdfDownloadCodeId(item: Record<string, unknown>): string | undefined {
  const query = item.pdf_download_query ?? item.pdfDownloadQuery ?? item.query
  if (query && typeof query === 'object') {
    return toOptionalString((query as Record<string, unknown>).code_id)
  }

  return toOptionalString(item.code_id ?? item.codeId)
}

function normalizeCode(raw: unknown, index: number): PartnerCodeItem {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const parentCode = toOptionalString(item.parent_code ?? item.parentCode)
  const typeValue = String(item.type ?? item.code_type ?? '')
  const type: PartnerCodeItem['type'] =
    typeValue === 'sub' || typeValue === 'sub_code' || parentCode ? 'sub' : 'primary'
  const qrAssets = readQrAssets(item)
  const pdfDownloadCodeId = readPdfDownloadCodeId(item)

  return {
    id: String(item.id ?? item.code_id ?? index),
    alphanumeric: String(item.alphanumeric ?? item.code ?? item.partner_code ?? ''),
    type,
    label: toOptionalString(item.label ?? item.branch_label),
    parentCode,
    status: String(item.status ?? 'active'),
    scans: toNumber(item.scans),
    registrations: toNumber(item.registrations),
    rewards: toNumber(item.rewards ?? item.rewards_issued),
    validFrom: toOptionalString(item.valid_from ?? item.validFrom),
    validTo: toOptionalString(item.valid_to ?? item.validTo ?? item.valid_until),
    pdfDownloadCodeId,
    scanUrl: qrAssets.scanUrl,
    qrPngUrl: qrAssets.qrPngUrl,
    qrSvgUrl: qrAssets.qrSvgUrl,
  }
}

function normalizeCollateralEntry(
  raw: unknown,
  index: number,
  fallbackLabel?: string,
  fallbackTemplate?: string,
): CollateralItem | null {
  if (typeof raw === 'string' && raw.trim()) {
    return {
      id: `collateral-${index}`,
      label: fallbackLabel ?? `Download ${index + 1}`,
      template: fallbackTemplate ?? `collateral-${index}`,
      url: raw,
    }
  }

  if (!raw || typeof raw !== 'object') return null

  const item = raw as Record<string, unknown>
  const template = toOptionalString(item.key ?? item.template ?? item.template_key ?? fallbackTemplate)
  const url = toOptionalString(item.url ?? item.download_url ?? item.href ?? item.downloadUrl)

  if (!template && !url) return null

  return {
    id: String(item.id ?? item.key ?? fallbackTemplate ?? `collateral-${index}`),
    label: String(item.label ?? item.name ?? item.title ?? fallbackLabel ?? 'Download'),
    template: template ?? String(item.id ?? item.key ?? `collateral-${index}`),
    description: toOptionalString(item.description),
    url,
    type: toOptionalString(item.type ?? item.format),
  }
}

function normalizeCollateral(raw: Record<string, unknown>): CollateralItem[] {
  const collateral: CollateralItem[] = []

  const list = raw.collateral ?? raw.collateral_items ?? raw.print_collateral
  if (Array.isArray(list)) {
    list.forEach((entry, index) => {
      const item = normalizeCollateralEntry(entry, index)
      if (item) collateral.push(item)
    })
  }

  const urls = raw.collateral_urls ?? raw.collateralUrls
  if (urls && typeof urls === 'object' && !Array.isArray(urls)) {
    Object.entries(urls as Record<string, unknown>).forEach(([key, value], index) => {
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
      const item = normalizeCollateralEntry(value, index, label, key)
      if (item) collateral.push(item)
    })
  }

  return collateral
}

function normalizeCodeCentre(raw: unknown): PartnerCodeCentreData {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const codesSource = Array.isArray(data.codes)
    ? data.codes
    : Array.isArray(data.partner_codes)
      ? data.partner_codes
      : []

  const primaryDownload = data.primary_code_pdf_download ?? data.primaryCodePdfDownload
  const primaryDownloadCodeId =
    primaryDownload && typeof primaryDownload === 'object'
      ? readPdfDownloadCodeId(primaryDownload as Record<string, unknown>)
      : undefined

  return {
    codes: codesSource.map(normalizeCode),
    collateral: normalizeCollateral(data),
    primaryPdfDownloadCodeId: primaryDownloadCodeId,
    flyerPdfUrl: toOptionalString(
      data.flyer_pdf_url ?? data.flyerPdfUrl ?? data.flyer_url ?? data.flyer_pdf,
    ),
  }
}

export async function fetchPartnerCodeCentre(
  accessToken: string,
): Promise<{ success: true; data: PartnerCodeCentreData } | { success: false; error: string }> {
  const result = await partnerGet<unknown>('partner-code-centre', accessToken)

  if (!result.success) {
    return result
  }

  return {
    success: true,
    data: normalizeCodeCentre(result.data),
  }
}

export async function requestPartnerSubCode(
  accessToken: string,
  input: SubCodeRequestInput,
): Promise<{ success: true; data: unknown } | { success: false; error: string }> {
  const body: SubCodeRequestInput = {
    label: input.label.trim(),
  }

  if (input.branch_id?.trim()) {
    body.branch_id = input.branch_id.trim()
  }

  if (input.notes?.trim()) {
    body.notes = input.notes.trim()
  }

  return partnerPost<unknown>('partner-sub-code-request', accessToken, body)
}

export async function downloadPartnerCodePdf(
  accessToken: string,
  codeId?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const searchParams = codeId ? { code_id: codeId } : undefined
  const result = await partnerDownload(
    'partner-code-pdf',
    accessToken,
    searchParams,
    'partner-code.pdf',
  )

  if (!result.success) {
    return result
  }

  triggerBrowserDownload(result.blob, result.filename)
  return { success: true }
}

export async function downloadPartnerCollateralPdf(
  accessToken: string,
  template: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const normalizedTemplate = template.trim()
  if (!normalizedTemplate) {
    return { success: false, error: 'Collateral template is required.' }
  }

  const result = await partnerDownload(
    'partner-collateral-pdf',
    accessToken,
    { template: normalizedTemplate },
    `${normalizedTemplate}.pdf`,
  )

  if (!result.success) {
    return result
  }

  triggerBrowserDownload(result.blob, result.filename)
  return { success: true }
}
