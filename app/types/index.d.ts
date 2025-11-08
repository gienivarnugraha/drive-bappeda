import type { Database, Tables } from "./database.types"

export interface User extends Tables<'profile'> { }

export type Category = Omit<Tables<'categories'>, 'metadata' | 'created_at'> & {
  metadata?: {
    name?: string
    description?: string
  }
}

// export interface Division extends Tables<'divisions'> { }
export type Division = Omit<Tables<'divisions'>, 'metadata' | 'created_at'> & {
  metadata?: {
    name?: string
    description?: string
  }
}

export interface Document extends Tables<'documents'> {
  metadata: DocumentMetadata
}

//export interface Results extends Database['public']['Functions']['get_documents']['Returns'] { }
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
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
