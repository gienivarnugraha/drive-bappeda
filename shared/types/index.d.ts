import type { Categories, Documents, Divisions } from "#server/database/schema"

export type Category = Omit<Categories, 'metadata' | 'created_at'> & {
  metadata?: {
    display_name?: string
    description?: string
  }
}

export type Division = Omit<Divisions, 'metadata' | 'created_at'> & {
  metadata?: {
    display_name?: string
    description?: string
  }
}

export interface Document extends Documents {
  metadata: DocumentMetadata
}

export type Results = Document & {
  categories: Category[]
  divisions: Division[]
}

export interface StorageMeta {
  filename: string
  extension: string
  contentType: string
  thumbnailSrc: string
  fileSize: number
}

export interface DocumentMetadata extends StorageMeta {
  summary: string
  fileId: string
  docIds: string[]
  category_id: number[]
  division_id: number[]
}



export interface Notification {
  id: number
  unread?: boolean
  sender: string
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
