import type { AvatarProps } from '@nuxt/ui'

export interface User {
  id: number
  name: string
  avatar?: AvatarProps
  uuid: string
}

export interface Category {
  id: number
  name: string
  metadata: {
    name: string
    description?: string
  }
}

export interface Division {
  id: number
  name: string
  metadata: {
    name: string
    description?: string
    icon?: string
  }
}

export interface Document {
  id: number
  uuid: string
  filename: string
  description?: string
  title: string
  categories: Category[]
  divisions: Division[]
  created_at: string
  metadata: DocumentMetadata
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

export interface FilteredData {
  documents: Document
  categories: Category
  divisions: Division
}

type OmitFilteredData = Omit<FilteredData, 'categories' | 'divisions'>

export type Results = Document & {
  categories: Category[]
  divisions: Division[]
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
