import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface Division {
  id: number
  name: string
  metadata?: {
    description?: string
    icon?: string
  }
}

export interface Document {
  id: number
  uuid: string
  filename: string
  title: string
  categories: Category[]
  divisions: Division[]
  created_at: string
  metadata: DocumentMetadata
}

export interface DocumentMetadata {
  thumbnailSrc?: string
  summary: string
  filename: string
  filePath?: string
  extension: string
  fileSize: number
  fileId: string
  uploadedAt: date
  createdAt: date
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
