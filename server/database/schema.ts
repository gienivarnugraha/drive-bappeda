import { pgTable, uniqueIndex, timestamp, text, uuid, vector, index, integer, varchar, jsonb } from 'drizzle-orm/pg-core'
import { v4 as uuid_generate_v4 } from 'uuid'


// --- categories Table ---
export type Categories = typeof categories.$inferSelect
export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  name: text('name').unique(),
  metadata: jsonb('metadata')
}, (table) => [
  uniqueIndex("cat_name_idx").on(table.name)
])

// --- divisions Table ---
export type Divisions = typeof divisions.$inferSelect
export const divisions = pgTable('divisions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  name: varchar('name'),
  metadata: jsonb('metadata')
}, (table) => [
  uniqueIndex("div_name_idx").on(table.name)
])

// --- documents Table ---
export type Documents = typeof documents.$inferSelect
export const documents = pgTable('documents', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  filename: text('filename').unique(),
  title: text('title'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  uuid: text('uuid')
}, (table) => [
  uniqueIndex("filename_idx").on(table.filename)
])

// --- categories_documents_divisions Table (Junction Table) ---
export type CategoriesDocumentsDivisions = typeof categoriesDocumentsDivisions.$inferSelect
export const categoriesDocumentsDivisions = pgTable('categories_documents_divisions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  categoryId: integer('category_id').references(() => categories.id),
  documentId: integer('document_id').references(() => documents.id),
  divisionId: integer('division_id').references(() => divisions.id)
})

// --- documents_summary Table ---
// NOTE: 'embedding' has a USER-DEFINED type. You'll need to define a custom Drizzle type for this or use a column type that matches your specific embedding library (e.g., 'vector' for pgvector, or 'text' if storing a string representation).
// For demonstration, I'm using text for 'embedding', but you should adjust this.
export type DocumentsSummary = typeof documentsSummary.$inferSelect
export const documentsSummary = pgTable('documents_summary', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  content: text('content'),
  metadata: jsonb('metadata'),
  embedding: vector('embedding', { dimensions: 1536 })
}, table => [
  index('documents_summary_bappeda_pkey').using('hnsw', table.embedding.op('vector_cosine_ops'))
])

// users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(uuid_generate_v4()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  uniqueIndex("email_idx").on(table.email)
])

export type User = typeof users.$inferSelect
