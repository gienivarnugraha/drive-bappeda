import type { tables } from "~~/server/utils/drizzle"

export type Categories = typeof tables.categories.$inferSelect

export type Divisions = typeof tables.divisions.$inferSelect

export type Documents = typeof tables.documents.$inferSelect & {
  metadata: DocumentMetadata
}

export type CategoriesDocumentsDivisions = typeof tables.categoriesDocumentsDivisions.$inferSelect

export type DocumentsSummary = typeof tables.documentsSummary.$inferSelect

export type User = typeof tables.users.$inferSelect

export type FetchResponse<T> = {
  message: string
  data?: T
}

export type ItemMetadata = {
  display_name?: string
  description?: string
}
export type Category = Omit<Categories, 'createdAt' | 'metadata'> & {
  metadata?: ItemMetadata
}

export type Division = Omit<Divisions, 'createdAt' | 'metadata'> & {
  metadata?: ItemMetadata
}

export type Results = Documents & {
  categories: Category[]
  divisions: Division[]
}

export interface StorageMeta {
  filepath: string
  extension: string
  // contentType: string
  thumbnailSrc: string
  fileSize: number
}

export interface DocumentMetadata extends StorageMeta {
  filename: string
  summary: string
  fileId: string
  createdAt: Date
  docIds: string[]
  contentType: string
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

export type FileMeta = {
  createdAt: number
  size: number
  type: string
  name: string
}


export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
