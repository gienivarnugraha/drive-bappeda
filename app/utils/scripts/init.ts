//import 'dotenv/config'
import { join, resolve, extname, basename } from 'node:path';
import { readdir, readFile, statSync, writeFile, existsSync, readFileSync } from 'node:fs';
import { PDFLoader } from "./pdfLoader";
//import postgres from 'postgres';
import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file';
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document, type DocumentInput } from "@langchain/core/documents";
import { getModel, getVectorStore } from '../../../server/utils/ai';
// import { generateAnswerFromDocument } from '../server/utils/rag';
import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from '@langchain/core/prompts';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { InMemoryStore } from "@langchain/core/stores";
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { inspect } from 'node:util';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { formatDocumentsAsString } from 'langchain/util/document';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';
import { generateAnswerFromDocument, getRetriever } from '../../../server/utils/rag';
import { spawn } from 'node:child_process';
import { TextLoader } from "langchain/document_loaders/fs/text";
import supabase from '../../../server/utils/supabase';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { DocxLoader, } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { type DocumentMetadata } from '~/types';

const model = getModel('google')
const documentPath = process.env.DOCUMENT_PATH as string

const documentWhiteList = ['.md', '.docx', '.csv', '.txt', '.pdf']

const idKey = 'doc_id'

const convertToMarkdown = async (command: string) => {
    const sourceDirectory = './pdfs_to_convert';
    const pythonScript = 'markdown.py';

    const scriptPath = join(__dirname, pythonScript);

    // Pass the source and output directories as arguments
    const pythonProcess = spawn('python', [scriptPath, sourceDirectory]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        if (code !== 0) {
            console.error('PDF conversion failed.');
        } else {
            console.log('PDF conversion completed successfully.');
        }
    });
}

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

        // console.log(query)

    } catch (error) {
        console.log(error)

    }
}

const listDocuments = (folderPath: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        readdir(folderPath, (err, files) => {
            let result: string[] = []

            if (err) {
                console.error("Error reading directory:", err);
                return;
            }

            files
                .filter(file =>
                    documentWhiteList.includes(extname(file).toLowerCase())
                )
                .map(file => join(folderPath, file))
                .forEach(file => result.push(file))

            console.warn('list files found...', result)

            resolve(result)
        })
    })
}

function isValidHttpURL(file: string) {
    let url;

    try {
        url = new URL(file);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
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
    let loader;

    console.log('loading document...')


    if (isValidHttpURL(file)) {
        loader = new CheerioWebBaseLoader(file)
    } else {
        const extension = extname(file);

        switch (extension) {
            case '.pdf':
                loader = new PDFLoader(file, {
                    parsedItemSeparator: ' ',
                });
                break;
            case '.md':
                loader = new TextLoader(file);
                break;
            case '.txt':
                loader = new TextLoader(file);
                break;
            case '.csv':
                loader = new CSVLoader(file);
                break;
            case '.doc':
                loader = new DocxLoader(file, { type: 'doc' });
                break;
            case '.docx':
                loader = new DocxLoader(file);
                break;
            default:
                throw new Error(`Unsupported file extension: ${extension}`);
        }
    }

    // const loader = new MultiFileLoader(files, {
    //     ".pdf":(path)=> new PDFLoader(path, {
    //         parsedItemSeparator: ' ',
    //     }),
    //     ".md":(path)=> new TextLoader(path),
    //     ".txt":(path)=> new TextLoader(path),
    //     ".csv":(path)=> new CSVLoader(path),
    //     ".doc":(path)=> new DocxLoader(path, { type: 'doc' }),
    //     ".docx":(path)=> new DocxLoader(path)
    // })

    return await loader.load();
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
    const extension = extname(file);

    let splitter: RecursiveCharacterTextSplitter

    const chunkOptions = {
        chunkOverlap: 10,
        chunkSize: 768 * 8,
    };

    if (extension === '.md') {
        splitter = new MarkdownTextSplitter(chunkOptions)
    } else {
        splitter = new RecursiveCharacterTextSplitter(chunkOptions)

    }

    return splitter
}

const generateSummaries = async (docs: Document[], ids: { fileId: string, docIds: string[] }, filepath: string) => {

    const fileSummary = `${basename(filepath, extname(filepath))}_summary.json`

    const pathSummary = join(documentPath, fileSummary)

    let summaries: Document[]

    if (existsSync(pathSummary)) {
        console.log('file json exists...', pathSummary)

        let json = JSON.parse(readFileSync(pathSummary, 'utf-8'))

        if (docs.length !== json.length) {
            console.log('file json exists but document length is different...', pathSummary)
            summaries = await getDocumentSummary(docs, ids)

            const content = JSON.stringify(summaries)

            writeFile(pathSummary, content, err => {
                console.log('rewriting file...', pathSummary)
                if (err) {
                    console.log(err, content)
                }
            })
        } else {
            console.log('retrieve exisiting file...', pathSummary)
            summaries = json.map((doc: DocumentInput<Record<string, any>>) => new Document(doc))
        }

    } else {
        console.log('file doesnt exists', pathSummary)
        summaries = await getDocumentSummary(docs, ids)

        const content = JSON.stringify(summaries)

        writeFile(pathSummary, content, err => {
            console.log('writing new file', pathSummary)
            if (err) {
                console.log(err, content)
            }
        })

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
    console.log('getting documents summary...')

    const queryOutput = z.object({
        title: z.string().describe("Title of the document"),
        summary: z.string().describe("Summary of the document"),
        attachment: z.optional(z.object({
            formulas: z.optional(z.object({
                name: z.string().describe("Formula name"),
                formula: z.string().describe("Formula"),
                lines: z.object({
                    from: z.number().describe("Start line number"),
                    to: z.number().describe("End line number"),
                })
                    .describe("Line number of the formula to insert later")
            })).describe("Formulas"),
            images: z.optional(z.object({
                name: z.string().describe("image name"),
                image_link: z.string().describe("image"),
                lines: z.object({
                    from: z.number().describe("Start line number"),
                    to: z.number().describe("End line number"),
                })
                    .describe("Line number of the image to insert later")
            })),
            charts: z.optional(z.object({
                name: z.string().describe("chart name"),
                data: z.array(
                    z.object({
                        labels: z.string().describe("labels"),
                        datasets: z.array(
                            z.object({
                                label: z.string().describe("label of dataset"),
                                data: z.array(
                                    z.number().describe("data in number")
                                ),
                            })
                        )
                    })
                ).describe("chart"),
                lines: z.object({
                    from: z.number().describe("Start line number"),
                    to: z.number().describe("End line number"),
                })
                    .describe("Line number of the chart to insert later")
            })),
        })),
        loc: z.object({
            pageNumber: z.object({
                from: z.number().describe("Start page number"),
                to: z.number().describe("End page number"),
            }).describe("Page range number"),
            lines: z.object({
                from: z.number().describe("Start line number"),
                to: z.number().describe("End line number"),
            })
                .describe("Line number")
        }).describe("Location of the summary"),
    });

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
            metadata: (doc: Document) => doc.metadata,
        },
        prompt,
        model.withStructuredOutput(queryOutput),
    ]);

    const summaries = await chain.batch(docs, {
        maxConcurrency: 1,
    });

    console.log('successfully getting documents summary...')

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
            },
        });
    });


}


/**
 * Sets the vector store with the given file.
 * If the file exists in the database, it will use the existing data.
 * If the file does not exist in the database, it will create new data and add it to the vector store.
 * @param {string} file - The file path with extension
 * @returns {Promise<SupabaseVectorStore>} - A promise that resolves to a SupabaseVectorStore instance
 */
export const setVectorStore = async (filepath: string, documentData: { category_id: number[], division_id: number[] }) => {
    const vectorstore = getVectorStore()

    const documents = await loadDocument(filepath)

    const splitter = documentSplitter(filepath)

    const docs = await splitter.splitDocuments(documents)

    const extension = extname(filepath)

    const filename = basename(filepath, extension)

    console.log('getting ids from database...', filename)

    const { data, error } = await supabase
        .from('documents')
        .select()
        .ilike('uuid', `%${filename}%`)

    if (error) {
        console.error('Failed to get documents from database', error)
    }

    if (data?.length) {
        console.log('file exists in database...', filename)
    } else {
        console.log('file not exists in database...')

        const fileId = `${filename}_${uuid()}`

        const ids = {
            docIds: docs.map((_, i) => `${filename}_${i}`),
            fileId
        }

        const metadata = getBasicMetadata(filepath)

        const data = {
            ...ids,
            ...metadata,
            ...documentData
        }

        const summaries = await generateSummaries(docs, ids, filepath)

        console.log('insert new data to database...', filename)

        await storeToDB(docs.slice(0, 5), data)

        console.log('adding data to vector store...', filename)

        await vectorstore.addDocuments(summaries);

    }
    console.log('success adding to vector store...', filename)

    return vectorstore
}


const getBasicMetadata = (filePath: string) => {
    console.log('geting meta data...', filePath)
    const stats = statSync(filePath);

    return {
        filename: basename(filePath),
        extension: extname(filePath),
        filePath,
        filesize: stats.size, // Size in bytes
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
    };
};


/**
 * Stores the given documents to the database with the given metadata.
 * @param doc The documents to be stored.
 * @param data The metadata of the documents, including the fileId, filename, and docIds.
 * @returns A promise that resolves when the data has been successfully stored to the database.
 */

const storeToDB = async (doc: Document[], data: DocumentMetadata & { category_id: number[], division_id: number[] }) => {
    const queryOutput = z.object({
        title: z.string().describe("Title of the document"),
        summary: z.string().describe("Summary of the document"),
    });

    const { category_id, division_id, filename } = data


    console.log('generating file summary ...', filename)

    const prompt = PromptTemplate.fromTemplate(`
            You're a helpful AI assistant. 

            - Summarize in indonesian language the following document with no more than 5 sentence
            - Give context with no more than 5 words what is it about based on the content,
            - and provide additional information from metadata like the title of the document, filename information

            Content:
            {content}
            `)

    const content = formatDocumentsAsString(doc)

    const { title, summary } = await prompt.pipe(model.withStructuredOutput(queryOutput)).invoke({ content })

    const { data: docResponse, error: docerror } = await supabase
        .from('documents')
        .insert({
            uuid: filename,
            title,
            filename,
            metadata: {
                summary,
                ...data
            }
        })
        .select()

    console.log('success creating new data...', filename)

    if (docerror) {
        console.log('docerror', docerror)
    }

    if (docResponse) {

        const { data: relationResponse, error: relationError } = await supabase
            .from('categories_documents_divisions')
            .insert({
                document_id: docResponse[0].id,
                category_id,
                division_id
            })
            .select()

        if (relationError) {
            console.log('relationError', relationError)
        }

        if (relationResponse) {
            console.log('success adding relation...', relationResponse)
        }
    }
}

async function run() {
    try {
        // await createTable()

        const folderpath = resolve(documentPath);

        const docs = await listDocuments(folderpath)

        console.log('found documents:', docs)

        // for (let doc of docs) {
        //     console.warn('initiating document:', doc)
        //     await setVectorStore(doc)
        // }

        // const path = `${process.env.DOCUMENT_PATH}/rispam.md`

        // await setVectorStore(path)

        // const retriever = getRetriever()

        // const result = await retriever.invoke('jumlah sampah dan jumlah orang di semarang')

        // console.log(result.length, inspect(result, false, null, true))

        // const model = getModel('google')

        // const summaries = await summarize(split)

        // const retriever = getRetriever()

        // await retriever.addDocuments(docs);

        // const generate = generateAnswerFromDocument()

        // const result = await generate.invoke('skenario dan proyeksi pengurangan sampah yang optimal dengan gambar dan tabel')

        // console.log(inspect(result, false, null, true))

    } catch (error) {
        console.error('error database', error)
    }
}
