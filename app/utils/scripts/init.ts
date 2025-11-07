// import 'dotenv/config'
import { join, resolve, extname, basename } from 'node:path'
import { readdir, readFile, statSync, writeFile, existsSync, readFileSync } from 'node:fs'
import { PDFLoader } from './pdfLoader'
// import postgres from 'postgres';
import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file'
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document, type DocumentInput } from '@langchain/core/documents'
import { getModel, getVectorStore } from '../ai'
// import { generateAnswerFromDocument } from '../server/utils/rag';
import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from '@langchain/core/prompts'
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables'
import { InMemoryStore } from '@langchain/core/stores'
import { ParentDocumentRetriever } from 'langchain/retrievers/parent_document'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { inspect } from 'node:util'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { formatDocumentsAsString } from 'langchain/util/document'
import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import { generateAnswerFromDocument, getRetriever } from '../rag'
import { spawn } from 'node:child_process'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import supabase from '../supabase'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import type { DocumentMetadata, StorageMeta } from '~/types'
import { getFileExtension, sanitizeFileName } from '~/utils'
import { modifyRelation } from '~/utils/db'
import { sseSend } from '~/utils/sse'
import { clampCharacters } from '~/utils'
import type { DocumentLoader } from '@langchain/core/document_loaders/base'
import useSupabaseStorage from '~/utils/storage'

const model = getModel('openai')

const storage = useSupabaseStorage('documents')

const ALLOWED_TYPES = ['.md', 'doc', '.docx', '.csv', '.txt', '.pdf']

const MIME_TYPE_MAP: { [key: string]: string } = {
  // --- DOCUMENTS & TEXT ---
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.csv': 'text/csv',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // --- IMAGES ---
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

const idKey = 'doc_id'

const createTable = async () => {
  // const sql = postgres(process.env.SUPABASE_PG_URL as string, {
  //     ssl: {
  //         rejectUnauthorized: false
  //     }
  // });

  const createQuery = `
        -- First, ensure the 'pgvector' extension is installed and enabled.
        -- If not, you may need to install it on your system and then run this command:
        CREATE EXTENSION IF NOT EXISTS vector;

        -- This command creates a new table named 'vector_store' to hold your vector embeddings.
        CREATE TABLE IF NOT EXISTS documents_summary (
            id BIGSERIAL PRIMARY KEY,
            -- The VECTOR data type is provided by the pgvector extension.
            -- The number in parentheses is the dimension of your embeddings (e.g., 1536 for OpenAI's ada-002 model).
            embedding VECTOR(1536), 
            
            -- An optional column to store the original text or metadata associated with the embedding.
            content TEXT,
            metadata JSONB
        );

        -- Creating an index on the embedding column is crucial for fast similarity searches.
        -- This GIST index is highly recommended for large datasets and efficient lookups.
        -- CREATE INDEX ON documents_summary USING GIST (embedding);
        CREATE INDEX ON documents_summary USING hnsw (embedding vector_cosine_ops);

        -- Create a function to search for documents
        create function match_documents (
            query_embedding vector(1536),
            match_count int default null,
            filter jsonb DEFAULT '{}'
            ) returns table (
            id bigint,
            content text,
            metadata jsonb,
            similarity float
        )
        
        language plpgsql
        as $$
        #variable_conflict use_column
        begin
        return query
        select
            id,
            content,
            metadata,
            1 - (documents_summary.embedding <=> query_embedding) as similarity
        from documents_summary
        where metadata @> filter
        order by documents_summary.embedding <=> query_embedding
        limit match_count;
        end;
        $$;
        `

  try {
    // const query = await sql`${createQuery}`

    // sseSend("push:notif",{message: quer}, status:'info'y)

  } catch (error) {
    console.error(error)
  }
}

const listDocuments = (folderPath: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    readdir(folderPath, (err, files) => {
      const result: string[] = []

      if (err) {
        console.error('Error reading directory:', err)
        return
      }

      files
        .filter(file =>
          ALLOWED_TYPES.includes(extname(file).toLowerCase())
        )
        .map(file => join(folderPath, file))
        .forEach(file => result.push(file))

      console.warn('list files found...', result)

      resolve(result)
    })
  })
}

function isValidHttpURL(file: string) {
  let url

  try {
    url = new URL(file)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

/**
 * Loads a document from a given file path or URL.
 * Supports PDF, MD, DOCX, and CSV file extensions.
 * If the file path is a URL, it will be loaded using the CheerioWebBaseLoader.
 * If the file path is a local file, it will be loaded using the appropriate loader
 * based on the file extension.
 * @throws {Error} If the file extension is not supported.
 * @param {string} file - The file path or URL to load.
 * @returns {Promise<Document[]>} A promise that resolves to an array of loaded documents.
 */
export const loadDocument = async (file: string): Promise<Document[]> => {
  let loader: any

  sseSend('push:notif', { message: `loading document... ${clampCharacters(file)}`, status: 'info' })

  const extension = extname(file)

  if (isValidHttpURL(file) && extension === '.pdf') {
    try {
      let pdf = await storage.getItem(file)

      if (pdf) {
        loader = new PDFLoader(pdf, {
          parsedItemSeparator: ' '
        })
      }

    } catch (error) {
      console.log('Error fetching pdf file:', error)
      sseSend('push:notif', { message: `Error fetching pdf file... ${clampCharacters(file)}`, status: 'error' })
    }

  } else {

    switch (extension) {
      case '.pdf':
        loader = new PDFLoader(file, {
          parsedItemSeparator: ' '
        })
        break
      case '.md':
        loader = new TextLoader(file)
        break
      case '.txt':
        loader = new TextLoader(file)
        break
      case '.csv':
        loader = new CSVLoader(file)
        break
      case '.doc':
        loader = new DocxLoader(file, { type: 'doc' })
        break
      case '.docx':
        loader = new DocxLoader(file)
        break
      default:
        throw new Error(`Unsupported file extension: ${extension}`)
    }
  }

  return await loader.load()
}

/**
 * Returns a pair of splitters for the given file extension.
 * The parent splitter is used to split the document into chunks.
 * The child splitter is used to split the chunks into smaller sub-chunks.
 * The parent splitter is overridden for markdown files to use the MarkdownTextSplitter.
 * For other file extensions, the RecursiveCharacterTextSplitter is used.
 * @param file The file path with extension
 * @returns An object with two properties: splitter and childSplitter
 */
export const documentSplitter = (file: string) => {
  const extension = extname(file)

  let splitter: RecursiveCharacterTextSplitter

  const chunkOptions = {
    chunkOverlap: 10,
    chunkSize: 768 * 8
  }

  if (extension === '.md') {
    splitter = new MarkdownTextSplitter(chunkOptions)
  } else {
    splitter = new RecursiveCharacterTextSplitter(chunkOptions)
  }

  return splitter
}

const generateSummaries = async (docs: Document[], ids: { fileId: string, docIds: string[] }, filepath: string) => {
  const fileSummary = `${sanitizeFileName(filepath)}_summary.json`

  let summaries: Document[] | undefined

  if (await storage.hasItem(fileSummary)) {
    sseSend('push:notif', { message: `file json exists... ${clampCharacters(fileSummary)}`, status: 'info' })

    const fileExists = await storage.getItem(fileSummary)

    const json = JSON.parse(await fileExists?.text() as string)

    if (docs.length !== json.length) {
      sseSend('push:notif', { message: `file json exists but document length is different... ${clampCharacters(fileSummary)}`, status: 'info' })
      summaries = await getDocumentSummary(docs, ids)

      const summariesContent = JSON.stringify(summaries)

      if (await storage.setItem(fileSummary, summariesContent)) {
        sseSend('push:notif', { message: `rewriting file... ${clampCharacters(fileSummary)}`, status: 'info' })
      }


    } else {
      sseSend('push:notif', { message: `retrieve exisiting file... ${clampCharacters(fileSummary)}`, status: 'info' })
      summaries = json.map((doc: DocumentInput<Record<string, any>>) => new Document(doc))
    }
  } else {
    sseSend('push:notif', { message: `file doesnt exists... ${clampCharacters(fileSummary)}`, status: 'info' })
    summaries = await getDocumentSummary(docs, ids)

    const content = JSON.stringify(summaries)

    if (await storage.setItem(fileSummary, content)) {
      sseSend('push:notif', { message: `writing new file... ${clampCharacters(fileSummary)}`, status: 'info' })
    }
  }

  return summaries
}

/**
 * A function that takes an array of documents as parameters and returns a promise that resolves to an object
 * with the following properties: title, summary, context, and source.
 * It uses the Google AI model to summarize the document.
 * @param documents - A slice of array from Document instances.
 * @returns A promise that resolves to an object with the following properties: title, summary, context, and source.
 */
export const getDocumentSummary = async (docs: Document[], ids: { fileId: string, docIds: string[] }) => {
  sseSend('push:notif', { message: 'getting documents summary...', status: 'info' })

  const queryOutput = z.object({
    title: z.string().describe('Title of the document'),
    summary: z.string().describe('Summary of the document'),
    attachment: z.object({
      formulas: z.array(z.object({
        name: z.string().describe('Formula name'),
        formula: z.string().describe('Formula'),
        lines: z.object({
          from: z.number().describe('Start line number'),
          to: z.number().describe('End line number')
        })
          .describe('Line number of the formula to insert later')
      })).describe('Formulas'),
      images: z.array(z.object({
        name: z.string().describe('image name'),
        image_link: z.string().describe('image'),
        lines: z.object({
          from: z.number().describe('Start line number'),
          to: z.number().describe('End line number')
        })
          .describe('Line number of the image to insert later')
      })).describe('images'),
      charts: z.array(z.object({
        name: z.string().describe('chart name'),
        data: z.array(
          z.object({
            labels: z.string().describe('labels'),
            datasets: z.array(
              z.object({
                label: z.string().describe('label of dataset'),
                data: z.array(
                  z.number().describe('data in number')
                )
              })
            )
          })
        ).describe('chart'),
        lines: z.object({
          from: z.number().describe('Start line number'),
          to: z.number().describe('End line number')
        })
          .describe('Line number of the chart to insert later')
      })).describe('charts')
    }),
    loc: z.object({
      pageNumber: z.object({
        from: z.number().describe('Start page number'),
        to: z.number().describe('End page number')
      }).describe('Page range number'),
      lines: z.object({
        from: z.number().describe('Start line number'),
        to: z.number().describe('End line number')
      })
        .describe('Line number')
    }).describe('Location of the summary')
  })

  const prompt = PromptTemplate.fromTemplate(`
            You're a helpful AI assistant. 

            - Summarize in indonesian language the following document with no more than 5 sentence
            - Give context with no more than 5 words what is it about based on the content,
            - if any image or formula is in the document remove from content and move it to attachment along with its properties and line number
            - and provide additional information from metadata like the title of the document, filename information

            Content:
            {content}
            `)

  const chain = RunnableSequence.from([
    {
      content: (doc: Document) => doc.pageContent,
      metadata: (doc: Document) => doc.metadata
    },
    prompt,
    model.withStructuredOutput(queryOutput)
  ])

  try {
    const summaries = await chain.batch(docs, {
      maxConcurrency: 1
    })

    sseSend('push:notif', { message: 'successfully getting documents summary...', status: 'info' })

    return summaries.map((summaryMap, i) => {
      const { summary, loc, title, attachment } = summaryMap

      // @ts-ignore
      const content = docs[i].pageContent

      return new Document({
        pageContent: content,
        metadata: {
          summary,
          loc,
          title,
          attachment,
          doc_id: ids.docIds[i],
          source_id: ids.fileId
        }
      })
    })
  } catch (error) {
    console.error('Error generating summaries', error)
    sseSend('push:notif', { message: 'Error generating documents summary', status: 'error' })
  }
}

/**
 * Sets the vector store with the given file.
 * If the file exists in the database, it will use the existing data.
 * If the file does not exist in the database, it will create new data and add it to the vector store.
 * @param {string} file - The file path with extension
 * @returns {Promise<SupabaseVectorStore>} - A promise that resolves to a SupabaseVectorStore instance
 */
export const setVectorStore = async (filepath: string, documentData: {
  category_id: number[],
  division_id: number[]
} & StorageMeta) => {
  const vectorstore = getVectorStore()

  const documents = await loadDocument(filepath)

  const splitter = documentSplitter(filepath)

  const docs = await splitter.splitDocuments(documents)

  const extension = extname(filepath)

  const filename = basename(filepath, extension)

  sseSend('push:notif', { message: `getting ids from database... ${clampCharacters(filename)}`, status: 'info' })

  const { data, error } = await supabase
    .from('documents')
    .select()
    .ilike('uuid', `%${filename}%`)

  if (error) {
    console.error('Failed to get documents from database', error)
    sseSend('push:notif', { message: `error getting ids from database... ${clampCharacters(filename)}`, status: 'error' })
  }

  // if (data?.length) {
  //   sseSend('push:notif', { message: `file exists in database... ${clampCharacters(filename)}`, status: 'info' })
  // } else {
  sseSend('push:notif', { message: `file not exists in database... ${clampCharacters(filename)}`, status: 'info' })

  const ids = {
    docIds: docs.map((_, i) => `doc_id_${filename}_${i}`),
    fileId: `${filename}_${uuid()}`
  }

  const fileMetadata = {
    ...ids,
    ...documentData,
  }

  const slicedDocuments = docs.slice(0, docs.length > 5 ? 5 : docs.length)

  await storeToDB(slicedDocuments, fileMetadata)

  const summaries = await getDocumentSummary(docs, ids)

  if (summaries) {
    sseSend("push:notif", { message: `adding data to vector store... ${clampCharacters(filename)}`, status: 'info' })

    await vectorstore.addDocuments(summaries);

    sseSend('push:notif', { message: `success adding to vector store... ${clampCharacters(filename)}`, status: 'success' })

  } else {
    sseSend("push:notif", { message: `no summaries generated... ${clampCharacters(filename)}`, status: 'error' })

  }

  // }

  return vectorstore
}


/**
 * Stores the given documents to the database with the given metadata.
 * @param doc The documents to be stored.
 * @param data The metadata of the documents, including the fileId, filename, and docIds.
 * @returns A promise that resolves when the data has been successfully stored to the database.
 */

const storeToDB = async (doc: Document[], data: Omit<DocumentMetadata, 'summary'> & { category_id: number[], division_id: number[] }) => {
  const queryOutput = z.object({
    title: z.string().describe('Title of the document'),
    summary: z.string().describe('Summary of the document'),
  })

  const { category_id, division_id, filename, fileId } = data

  sseSend('push:notif', { message: `generating title and summary... ${clampCharacters(filename)}`, status: 'info' })

  const prompt = PromptTemplate.fromTemplate(`
            You're a helpful AI assistant. 

            - Summarize in indonesian language the following content of the document dont describe the object but the content
            - and provide title of the document after you summarize

            Content:
            {content}
            `)
  const content = formatDocumentsAsString(doc)

  const { title, summary } = await prompt.pipe(model.withStructuredOutput(queryOutput)).invoke({ content })

  console.log('title and summary result:', title, summary)

  const { data: docResponse, error: docerror } = await supabase
    .from('documents')
    .insert({
      uuid: fileId,
      title,
      filename,
      description: summary,
      metadata: {
        summary,
        ...data
      }
    })
    .select()

  if (docerror) {
    console.error('Failed to insert document to database', docerror)

    sseSend('push:notif', { message: `error creating new data... ${clampCharacters(filename)}`, status: 'error' })
  }

  if (docResponse) {
    sseSend('push:notif', { message: `success creating new data... ${clampCharacters(filename)}`, status: 'info' })
    // insert to relation table
    const relationResponse = await modifyRelation({ document: docResponse[0], categories: category_id, divisions: division_id }, 'edit')

    if (relationResponse) {
      sseSend('push:notif', { message: 'success adding document relations...', status: 'info' })
    }
  }

  sseSend('push:notif', { message: 'success adding document...', status: 'success' })
}