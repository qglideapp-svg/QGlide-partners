export interface DocumentChecklistItem {
  id: string
  label: string
  complete: boolean
  status: string
  statusLabel: string
}

export interface PartnerDocumentItem {
  id: string
  documentType: string
  title: string
  fileType: string
  expiresAt?: string
  status: string
  statusLabel: string
  generatedAt?: string
  downloadable: boolean
}

export interface PartnerDocumentsData {
  title: string
  subtitle: string
  checklist: DocumentChecklistItem[]
  documents: PartnerDocumentItem[]
}

export type DocumentsPageLoaderData =
  | { mode: 'live'; data: PartnerDocumentsData }
  | { mode: 'error'; error: string }
