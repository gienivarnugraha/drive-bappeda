import type { Categories, Documents, Divisions, User as UserDB } from "~~/server/utils/drizzle"


export type FetchResponse<T> = {
  message: string
  data?: T
}

export interface User extends UserDB { }

export type ItemMetadata = {
  display_name?: string
  description?: string
}
export type Category = Omit<Categories, 'createdAt' | 'metadata'> & {
  metadata: ItemMetadata
}

export type Division = Omit<Divisions, 'createdAt' | 'metadata'> & {
  metadata: ItemMetadata
}

export interface Document extends Documents {
  metadata: DocumentMetadata
}

export type Results = Document & {
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
