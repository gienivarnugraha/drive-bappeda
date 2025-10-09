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
  category: string
}

export interface Document {
  id: number
  uuid: string
  filename: string
  string: string
  metadata: DocumentMetadata
}

export interface DocumentMetadata {
  filename: string
  filesize: number
}

export interface ChartData {
  id: number
  category: string
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
