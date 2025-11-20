// import 'dotenv/config'
import { extname } from 'node:path'
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document, type DocumentInput } from '@langchain/core/documents'
// import { generateAnswerFromDocument } from '~~/server/utils./server/utils/rag';
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
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ilike } from 'drizzle-orm'
import { ChatOpenAI } from '@langchain/openai'

import { PDFLoader } from '~~/server/utils/scripts/pdfLoader'
import { getModel, getVectorStore } from '~~/server/utils/ai'
import type { DocumentMetadata } from '#shared/types'
import { clampFilename, sanitizeFileName } from '#shared/utils'
import { modifyRelation } from '~~/server/utils/db'
import { sseSend } from '~~/server/utils/sse'
import { resolveStoragePath } from '~~/server/utils/file';
import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { convertToMarkdown } from '~~/server/utils/convert'

const idKey = 'doc_id'
/**
 * Loads a document from storage and returns a promise that resolves to an array of Document instances.
 * @param filename The name of the file to be loaded.
 * @returns A promise that resolves to an array of Document instances.
 * @throws If the file extension is unsupported or the file is not found.
 */
export const loadDocument = async (filename: string): Promise<Document[]> => {
  let loader: any

  sseSend('push:notif', { message: `loading document... ${clampFilename(filename)}`, status: 'info' })

  const extension = extname(filename)

  const storage = useStorage(process.env.STORAGE_KEY)

  if (!await storage.has(filename)) {
    throw createError({
      statusCode: 404,
      message: `File **${filename}** not found`,
    })
  }

  const file = await storage.getItemRaw<Buffer>(filename)
  const blob = new Blob([file as BlobPart], { type: 'application/pdf' })

  switch (extension) {
    case '.pdf':
      loader = new PDFLoader(blob, {
        parsedItemSeparator: ' '
      })
      break
    case '.md':
      loader = new TextLoader(blob)
      break
    case '.txt':
      loader = new TextLoader(blob)
      break
    case '.csv':
      loader = new CSVLoader(blob)
      break
    case '.doc':
      loader = new DocxLoader(blob) // DocxLoader doesn't have a 'type' option. It auto-detects.
      break
    case '.docx':
      loader = new DocxLoader(blob)
      break
    default:

      throw new Error(`Unsupported file extension: ${extension}`)
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

/**
 * Generates summaries for the given documents and stores them in the storage.
 * If the summary file for the given filename already exists, it will be retrieved.
 * If the document length is different from the existing summary, it will be rewritten.
 * @param docs The documents to generate summaries for.
 * @param ids The metadata for the documents, including the fileId, filename, and docIds.
 * @param filename The sanitized filename to store the summaries under.
 * @returns A promise that resolves with the generated summaries.
 */
const generateSummaries = async (docs: Document[], ids: { fileId: string, docIds: string[] }, filename: string) => {

  const model = getModel('openai')

  const fileSummary = `${sanitizeFileName(filename)}_summary.json`
  sseSend('push:notif', { message: `checking if backup summary exists... ${clampFilename(fileSummary)}`, status: 'info' })

  let summaries: Document[] | undefined

  const storage = useStorage(process.env.STORAGE_KEY)

  const filepath = `documents:${sanitizeFileName(filename, true)}`


  if (await storage.hasItem(`${filepath}:${fileSummary}`)) {
    sseSend('push:notif', { message: `file json exists... ${clampFilename(fileSummary)}`, status: 'info' })

    const fileExists = await storage.getItemRaw(fileSummary)

    const json = JSON.parse(fileExists as string)

    if (docs.length !== json.length) {
      sseSend('push:notif', { message: `file json exists but document length is different... ${clampFilename(fileSummary)}`, status: 'info' })
      summaries = await summarize(model, docs, ids)

      const summariesContent = JSON.stringify(summaries)

      await storage.setItemRaw(`${filepath}:${fileSummary}`, summariesContent)

      sseSend('push:notif', { message: `rewriting file... ${clampFilename(fileSummary)}`, status: 'info' })


    } else {
      sseSend('push:notif', { message: `retrieve exisiting file... ${clampFilename(fileSummary)}`, status: 'info' })
      summaries = json.map((doc: DocumentInput<Record<string, any>>) => new Document(doc))
    }
  } else {
    sseSend('push:notif', { message: `file doesnt exists... ${clampFilename(fileSummary)}`, status: 'info' })
    summaries = await summarize(model, docs, ids)

    const content = JSON.stringify(summaries)

    await storage.setItemRaw(`${filepath}:${fileSummary}`, content)

    sseSend('push:notif', { message: `writing new file... ${clampFilename(fileSummary)}`, status: 'info' })
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
const summarize = async (model: ChatGoogleGenerativeAI | ChatOpenAI, docs: Document[], ids: { fileId: string, docIds: string[] }) => {

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
 * Stores the given documents to the database with the given metadata.
 * @param doc The documents to be stored.
 * @param data The metadata of the documents, including the fileId, filename, and docIds.
 * @returns A promise that resolves when the data has been successfully stored to the database.
 */

const storeToDatabase = async (doc: Document[], data: Omit<DocumentMetadata, 'summary'> & { category_id: number[], division_id: number[] }) => {
  const queryOutput = z.object({
    title: z.string().describe('Title of the document'),
    summary: z.string().describe('Summary of the document'),
  })

  const model = getModel('openai')

  const { category_id, division_id, filename, fileId, ...rest } = data

  sseSend('push:notif', { message: `generating title and summary... ${clampFilename(filename)}`, status: 'info' })

  const prompt = PromptTemplate.fromTemplate(`
            You're a helpful AI assistant. 

            - Summarize in indonesian language the following content of the document dont describe the object but the content
            - and provide title of the document after you summarize

            Content:
            {content}
            `)
  const content = formatDocumentsAsString(doc)

  const { title, summary } = await prompt.pipe(model.withStructuredOutput(queryOutput)).invoke({ content })

  const db = useDrizzle()

  try {
    const response = await db.insert(tables.documents).values({
      uuid: fileId,
      title,
      filename,
      description: summary,
      metadata: {
        summary,
        ...rest
      }
    }).returning()

    sseSend('push:notif', { message: `success creating new data... ${clampFilename(filename)}`, status: 'info' })
    // insert to relation table
    const relationResponse = await modifyRelation({ documentId: response[0]?.id, categoryIds: category_id, divisionIds: division_id }, 'edit')

    if (relationResponse) {
      sseSend('push:notif', { message: 'success adding document relations...', status: 'info' })
    }

    sseSend('push:notif', { message: 'success adding document...', status: 'info' })
  } catch (error: any) {
    console.error('Failed to insert document to database', error)

    sseSend('push:notif', { message: `error creating new data... ${clampFilename(filename)}`, status: 'error' })

  }

}


const storeToVectorStore = async (docs: Document[], filename: string, documentMetaData: DocumentMetadata) => {
  const vectorstore = await getVectorStore()

  sseSend("push:notif", { message: `adding data to vector store... ${clampFilename(filename)}`, status: 'info' })

  const ids = {
    docIds: docs.map((_, i) => `doc_id_${filename}_${i}`),
    fileId: `${uuid()}_${filename}`
  }

  const fileMetadata = {
    ...ids,
    ...documentMetaData,
    filename
  }

  const slicedDocuments = docs.slice(0, docs.length > 5 ? 5 : docs.length)

  await storeToDatabase(slicedDocuments, fileMetadata)

  const summaries = await generateSummaries(docs, ids, filename)

  if (summaries) {

    await vectorstore.addDocuments(summaries);

    sseSend('push:notif', { message: `success adding to vector store... ${clampFilename(filename)}`, status: 'success' })

  }
}

/**
 * Process a document and add it to the database and vector store.
 * @param filename Sanitized name of the file (already kebab cased) to be processed.
 * @param documentMetaData The metadata of the document, including the fileId, filename, and docIds.
 * @returns A promise that resolves when the document has been successfully processed.
 * @throws If the file extension is unsupported or the file is not found.
 */
export const processDocument = async (filename: string, documentMetaData: DocumentMetadata) => {

  // SELFT HOST SERVER
  // const markdownPath = await convertToMarkdown(filename)

  // VERCEL
  const _filename = sanitizeFileName(filename as string, false)
  const dirname = sanitizeFileName(filename as string)
  const filepath = `documents:${dirname}:${_filename}`

  const documents = await loadDocument(filepath)

  const splitter = documentSplitter(filepath)

  const docs = await splitter.splitDocuments(documents)

  const db = useDrizzle()

  sseSend('push:notif', { message: `getting ids from database... ${clampFilename(filename)}`, status: 'info' })

  try {
    let filenameExists = await db
      .select()
      .from(tables.documents)
      .where(ilike(tables.documents.filename, `%${filename}%`))

    // IF File exists in the storage 
    if (filenameExists?.length) {
      sseSend('push:notif', { message: `file exists in database... ${clampFilename(filename)}`, status: 'info' })

      try {
        const vectorStoreExists = await db
          .select()
          .from(tables.documentsSummary)
          .where(sql`${tables.documentsSummary.metadata} ->> 'source_id' LIKE ${`%${filename}%`}`)

        // If vector of the file exists in the database
        if (vectorStoreExists?.length) {
          sseSend('push:notif', { message: `vector store exists in database... ${clampFilename(filename)}`, status: 'success' })

          return
        }

        // else add to vector store
        // await storeToVectorStore(docs, filename, documentMetaData)

      } catch (error: any) {
        console.error('error fetching vector store', error)
        sseSend('push:notif', { message: `error fetching vector store... ${clampFilename(filename)}`, status: 'error' })
        return
      }
    } else {
      // else add to database and vector store
      sseSend('push:notif', { message: `file not exists in database... ${clampFilename(filename)}`, status: 'info' })

      await storeToVectorStore(docs, filename, documentMetaData)

    }

  } catch (error) {
    console.error('Failed to get documents from database', error)
    sseSend('push:notif', { message: `error getting ids from database... ${clampFilename(filename)}`, status: 'error' })
    return
  }


}