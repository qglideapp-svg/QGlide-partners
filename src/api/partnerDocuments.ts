import { partnerDownload, partnerGet } from './client'
import type {
  DocumentChecklistItem,
  PartnerDocumentItem,
  PartnerDocumentsData,
} from '../types/documents'
import { triggerBrowserDownload } from '../utils/downloadBlob'

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function isTruthyFlag(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes'
  }
  return false
}

function normalizeChecklistItem(raw: unknown, index: number): DocumentChecklistItem {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const complete = isTruthyFlag(item.complete) || String(item.status ?? '').toLowerCase() === 'complete'

  return {
    id: String(item.id ?? `checklist-${index}`),
    label: String(item.label ?? item.name ?? 'Checklist item'),
    complete,
    status: String(item.status ?? (complete ? 'complete' : 'pending')),
    statusLabel: String(item.status_label ?? item.statusLabel ?? (complete ? 'Complete' : 'Pending')),
  }
}

function normalizeDocument(raw: unknown, index: number): PartnerDocumentItem {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>

  return {
    id: String(item.id ?? item.document_id ?? `document-${index}`),
    documentType: String(item.document_type ?? item.documentType ?? item.type ?? ''),
    title: String(item.title ?? item.name ?? 'Document'),
    fileType: String(item.file_type ?? item.fileType ?? item.format ?? 'PDF'),
    expiresAt: toOptionalString(item.expires_at ?? item.expiresAt ?? item.expiry),
    status: String(item.status ?? 'active'),
    statusLabel: String(item.status_label ?? item.statusLabel ?? item.status ?? 'Active'),
    generatedAt: toOptionalString(item.generated_at ?? item.generatedAt),
    downloadable: isTruthyFlag(item.downloadable) || item.downloadable === undefined,
  }
}

function normalizeDocumentsCentre(raw: unknown): PartnerDocumentsData {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const checklist = Array.isArray(data.checklist) ? data.checklist : []
  const documents = Array.isArray(data.documents) ? data.documents : []

  return {
    title: String(data.title ?? 'Document Centre'),
    subtitle: String(data.subtitle ?? 'Agreements, licences and compliance items'),
    checklist: checklist.map(normalizeChecklistItem),
    documents: documents.map(normalizeDocument),
  }
}

function documentFallbackFilename(title: string, fileType: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const extension = fileType.trim().toLowerCase().replace(/^\./, '') || 'pdf'

  return slug ? `${slug}.${extension}` : `document.${extension}`
}

export async function fetchPartnerDocuments(
  accessToken: string,
): Promise<{ success: true; data: PartnerDocumentsData } | { success: false; error: string }> {
  const result = await partnerGet<unknown>('partner-documents', accessToken)

  if (!result.success) {
    return result
  }

  return {
    success: true,
    data: normalizeDocumentsCentre(result.data),
  }
}

export async function downloadPartnerDocument(
  accessToken: string,
  document: Pick<PartnerDocumentItem, 'id' | 'title' | 'fileType'>,
): Promise<{ success: true } | { success: false; error: string }> {
  const trimmedId = document.id.trim()
  if (!trimmedId) {
    return { success: false, error: 'Document ID is required.' }
  }

  const result = await partnerDownload(
    'partner-documents',
    accessToken,
    { document_id: trimmedId },
    documentFallbackFilename(document.title, document.fileType),
  )

  if (!result.success) {
    return result
  }

  triggerBrowserDownload(result.blob, result.filename)
  return { success: true }
}
