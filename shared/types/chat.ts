import { z } from 'zod';

// --- Placeholders for External Types ---

// Define a placeholder schema for ProviderMetadata if not defined elsewhere.
// Replace z.any() with the actual schema if you have it.
const ProviderMetadataSchema = z.any().optional().nullable();
/*
Example if ProviderMetadata were { model: string, runtime: number }:
const ProviderMetadataSchema = z.object({
  model: z.string(),
  runtime: z.number(),
}).optional().nullable();
*/

// --- Concrete UIPart Schemas ---

/**
 * A text part of a message.
 */
export const TextUIPartSchema = z.object({
    type: z.literal('text'),
    text: z.string().describe('The text content.'),
    state: z.enum(['streaming', 'done']).optional().nullable().describe('The state of the text part.'),
    providerMetadata: ProviderMetadataSchema.describe('The provider metadata.'),
});
export type TextUIPart = z.infer<typeof TextUIPartSchema>;

/**
 * A reasoning part of a message.
 */
export const ReasoningUIPartSchema = z.object({
    type: z.literal('reasoning'),
    text: z.string().describe('The reasoning text.'),
    state: z.enum(['streaming', 'done']).optional().nullable().describe('The state of the reasoning part.'),
    providerMetadata: ProviderMetadataSchema.describe('The provider metadata.'),
});
export type ReasoningUIPart = z.infer<typeof ReasoningUIPartSchema>;

/**
 * A source part of a message.
 */
export const SourceUrlUIPartSchema = z.object({
    type: z.literal('source-url'),
    sourceId: z.string(),
    url: z.string().url(),
    title: z.string().optional().nullable(),
    providerMetadata: ProviderMetadataSchema,
});
export type SourceUrlUIPart = z.infer<typeof SourceUrlUIPartSchema>;

/**
 * A document source part of a message.
 */
export const SourceDocumentUIPartSchema = z.object({
    type: z.literal('source-document'),
    sourceId: z.string(),
    mediaType: z.string().describe('The IANA media type of the document.'),
    title: z.string(),
    filename: z.string().optional().nullable(),
    providerMetadata: ProviderMetadataSchema,
});
export type SourceDocumentUIPart = z.infer<typeof SourceDocumentUIPartSchema>;

/**
 * A file part of a message.
 */
export const FileUIPartSchema = z.object({
    type: z.literal('file'),
    mediaType: z.string().describe('IANA media type of the file.'),
    filename: z.string().optional().nullable().describe('Optional filename of the file.'),
    url: z.string().describe('The URL of the file. Can be a hosted URL or a Data URL.'),
    providerMetadata: ProviderMetadataSchema,
});
export type FileUIPart = z.infer<typeof FileUIPartSchema>;

/**
 * A step boundary part of a message.
 */
export const StepStartUIPartSchema = z.object({
    type: z.literal('step-start'),
});
export type StepStartUIPart = z.infer<typeof StepStartUIPartSchema>;

// Replace z.unknown() with the actual schemas for ToolUIPart, DynamicToolUIPart,
// and DataUIPart<DATA_TYPES>. These require external definitions (UIDataTypes, UITools).

// Placeholder for ToolUIPart and DynamicToolUIPart
const ToolUIPartSchema = z.unknown() as z.ZodType<any>;
const DynamicToolUIPartSchema = z.unknown() as z.ZodType<any>;

// Placeholder for DataUIPart<DATA_TYPES> - this is complex because it's a dynamic union.
const DataUIPartSchema = z.unknown() as z.ZodType<any>;


export const UIMessagePartSchema = z.union([
    TextUIPartSchema,
    ReasoningUIPartSchema,
    ToolUIPartSchema, // Placeholder
    DynamicToolUIPartSchema, // Placeholder
    SourceUrlUIPartSchema,
    SourceDocumentUIPartSchema,
    FileUIPartSchema,
    DataUIPartSchema, // Placeholder
    StepStartUIPartSchema,
]);

export type UIMessagePart = z.infer<typeof UIMessagePartSchema>;

export const UIMessageSchema = z.object({
    id: z.string().describe('A unique identifier for the message.'),
    role: z.enum(['system', 'user', 'assistant']).describe('The role of the message.'),
    metadata: z.unknown().optional().nullable().describe('The metadata of the message. (Replace z.unknown() with actual schema for METADATA)'),
    parts: z.array(UIMessagePartSchema).describe('The parts of the message. Use this for rendering the message in the UI.'),
});

export type UIMessage = z.infer<typeof UIMessageSchema>;

