import type { Categories, Documents, Divisions, tables } from "~~/server/utils/drizzle"

export type Categories = typeof tables.categories.$inferSelect

export type Divisions = typeof tables.divisions.$inferSelect

export type Documents = typeof tables.documents.$inferSelect & {
  metadata: DocumentMetadata
}

export type CategoriesDocumentsDivisions = typeof tables.categoriesDocumentsDivisions.$inferSelect

export type DocumentsSummary = typeof tables.documentsSummary.$inferSelect

export type User = typeof tables.users.$inferSelect

/**
 * Interface for the payload data stored inside the Access Token.
 */
export type UserSession = Omit<User, 'password'> & {
  loggedInAt: number; // Unix timestamp
}

/**
* Interface for a single Refresh Token entry in the store.
*/
export interface RefreshTokenEntry {
  accessToken: string;
  data: UserSession;
  // Consider adding 'createdAt' and 'expiresAt' for token lifecycle management
}



export type FetchResponse<T> = {
  message: string
  data?: T
}

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
