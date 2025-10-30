import { pgTable, serial, timestamp, text, unique, primaryKey, foreignKey, vector, index, bigint, varchar, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// --- categories Table ---
export const categories = pgTable('categories', {
    id: bigint('id', { mode: 'number' }).primaryKey().notNull().default(sql`nextval('categories_id_seq'::regclass)`),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    name: text('name').unique(),
    description: jsonb('metadata'),
});

// --- divisions Table ---
export const divisions = pgTable('divisions', {
    id: bigint('id', { mode: 'number' }).primaryKey().notNull().default(sql`nextval('divisions_id_seq'::regclass)`),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    name: varchar('name'),
    description: jsonb('metadata'),
});

// --- documents Table ---
export const documents = pgTable('documents', {
    id: bigint('id', { mode: 'number' }).primaryKey().notNull().default(sql`nextval('documents_id_seq'::regclass)`),
    filename: text('filename').unique(),
    title: text('title'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    uuid: text('uuid'),
});

// --- categories_documents_divisions Table (Junction Table) ---
export const categoriesDocumentsDivisions = pgTable('categories_documents_divisions', {
    id: bigint('id', { mode: 'number' }).primaryKey().notNull().default(sql`nextval('categories_documents_divisions_id_seq'::regclass)`),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    categoryId: bigint('category_id', { mode: 'number' }).references(() => categories.id),
    documentId: bigint('document_id', { mode: 'number' }).references(() => documents.id),
    divisionId: bigint('division_id', { mode: 'number' }).references(() => divisions.id),
});

export const documentsSummary = pgTable('documents_summary', {
    id: bigint('id', { mode: 'number' }).primaryKey().notNull().default(sql`nextval('documents_summary_id_seq'::regclass)`),
    content: text('content'),
    metadata: jsonb('metadata'),
    embedding: vector('embedding', { dimensions: 1536 }),
}, (table) => [
    index('documents_summary_pkey').using('hnsw', table.embedding.op('vector_cosine_ops')),
]);

// --- documents_summary Table ---
// NOTE: 'embedding' has a USER-DEFINED type. You'll need to define a custom Drizzle type for this or use a column type that matches your specific embedding library (e.g., 'vector' for pgvector, or 'text' if storing a string representation).
// For demonstration, I'm using text for 'embedding', but you should adjust this.
