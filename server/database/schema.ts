import { pgTable, uniqueIndex, timestamp, text, uuid, vector, index, integer, varchar, jsonb } from 'drizzle-orm/pg-core'
import { v4 as uuid_generate_v4 } from 'uuid'


// --- categories Table ---
export type Categories = typeof categories.$inferSelect
export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  name: text('name').unique().notNull(),
  metadata: jsonb('metadata')
}, (table) => [
  uniqueIndex("cat_name_idx").on(table.name)
])

// --- divisions Table ---
export type Divisions = typeof divisions.$inferSelect
export const divisions = pgTable('divisions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  name: varchar('name').unique().notNull(),
  metadata: jsonb('metadata')
}, (table) => [
  uniqueIndex("div_name_idx").on(table.name)
])

// --- documents Table ---
export type Documents = typeof documents.$inferSelect
export const documents = pgTable('documents', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  filename: text('filename').unique().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  metadata: jsonb('metadata').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  uuid: text('uuid').notNull()
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
  metadata: jsonb('metadata').$type<DocumentMetadata>(),
  embedding: vector('embedding', { dimensions: 1536 })
}, table => [
  index('documents_summary_bappeda_pkey').using('hnsw', table.embedding.op('vector_cosine_ops'))
])

// users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  uniqueIndex("email_idx").on(table.email)
])

export type User = typeof users.$inferSelect

/* 
-- DANGER: Dropping the function if it already exists to allow re-creation.
DROP FUNCTION IF EXISTS get_documents(page_size int, page_number int, filter_category_ids int[], filter_division_ids int[], order_by_column text, order_direction text);

-- Create the new function with type-corrected JSONB aggregation and default entries
CREATE OR REPLACE FUNCTION get_documents(
    page_size INT DEFAULT 50,
    page_number INT DEFAULT 1,
    filter_category_ids INT[] DEFAULT NULL,
    filter_division_ids INT[] DEFAULT NULL,
    
    order_by_column TEXT DEFAULT 'created_at',
    order_direction TEXT DEFAULT 'DESC'
)
RETURNS TABLE (
    id INT,
    filename TEXT,
    title TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    uuid TEXT,
    description TEXT,
    categories JSONB,
    divisions JSONB
)
LANGUAGE sql
AS $$
SELECT
    d.id,
    d.filename,
    d.title,
    d.metadata,
    d.created_at,
    d.uuid,
    d.description,
    
    -- If no categories (JSONB_AGG is NULL), return [{id: 0, name: 'No Category'}]
    COALESCE(
        JSONB_AGG(
            DISTINCT JSONB_BUILD_OBJECT('id', c.id, 'name', c.name) 
        ) FILTER (WHERE c.id IS NOT NULL), 
        '[{"id": 0, "name": "Tidak ada"}]'::JSONB
    ) AS categories,
    
    -- If no divisions (JSONB_AGG is NULL), return [{id: 0, name: 'No Division'}]
    COALESCE(
        JSONB_AGG(
            DISTINCT JSONB_BUILD_OBJECT('id', v.id, 'name', v.name) 
        ) FILTER (WHERE v.id IS NOT NULL), 
        '[{"id": 0, "name": "Tidak ada"}]'::JSONB
    ) AS divisions
    
FROM
    documents d
LEFT JOIN
    categories_documents_divisions cdd ON d.id = cdd.document_id
LEFT JOIN
    categories c ON cdd.category_id = c.id
LEFT JOIN
    divisions v ON cdd.division_id = v.id
WHERE
    -- Allows un-categorized documents (cdd.document_id IS NULL) OR documents matching the filter.
    (filter_category_ids IS NULL OR cdd.category_id = ANY(filter_category_ids) OR cdd.document_id IS NULL)
    AND 
    (filter_division_ids IS NULL OR cdd.division_id = ANY(filter_division_ids) OR cdd.document_id IS NULL)
GROUP BY
    d.id, d.filename, d.title, d.metadata, d.created_at, d.uuid, d.description
ORDER BY
    -- Custom ORDER BY implementation using CASE and dynamic column selection
    CASE WHEN order_by_column = 'id' AND order_direction = 'asc' THEN d.id END ASC,
    CASE WHEN order_by_column = 'id' AND order_direction = 'desc' THEN d.id END DESC,

    CASE WHEN order_by_column = 'title' AND order_direction = 'asc' THEN d.title END ASC,
    CASE WHEN order_by_column = 'title' AND order_direction = 'desc' THEN d.title END DESC,

    CASE WHEN order_by_column = 'filename' AND order_direction = 'asc' THEN d.filename END ASC,
    CASE WHEN order_by_column = 'filename' AND order_direction = 'desc' THEN d.filename END DESC,

    CASE WHEN order_by_column = 'created_at' AND order_direction = 'asc' THEN d.created_at END ASC,
    CASE WHEN order_by_column = 'created_at' AND order_direction = 'desc' THEN d.created_at END DESC,
    
    -- Default/Fallback Order (e.g., d.id DESC) if no match or default used
    d.id DESC

LIMIT page_size
OFFSET (page_number - 1) * page_size;
$$;
 */