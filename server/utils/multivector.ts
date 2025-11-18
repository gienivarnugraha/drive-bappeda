import { MultiVectorRetriever } from "@langchain/community/retrievers/multi_vector";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { InMemoryStore } from "@langchain/core/stores";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

// Step 1: Set up storage
const vectorstore = new Chroma(new OpenAIEmbeddings());
const docstore = new InMemoryStore();

// Step 2: Create the MultiVectorRetriever
const retriever = new MultiVectorRetriever({
    vectorstore: vectorstore,
    docstore: docstore,
    idKey: "doc_id", // Optional unique identifier for documents
});

// Step 3: Prepare and store documents
const docs = [
    new Document({
        pageContent: "LangChain is a framework for developing applications powered by large language models (LLMs).",
        metadata: { source: "intro" },
    }),
    new Document({
        pageContent: "Retrievers are an interface that returns documents given an unstructured query. A retriever does not need to be able to store documents, only to return them.",
        metadata: { source: "retriever_concept" },
    }),
];

// Step 4: Create multiple representations and add to stores
const docIds = docs.map((doc) => doc.metadata.source); // Example doc_id
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 50, chunkOverlap: 0 });

const childDocs = await textSplitter.splitDocuments(docs);
const summaryDocs = docs.map(
    (doc, i) => new Document({
        pageContent: `Summary for doc ${i + 1}: ${doc.pageContent.slice(0, 100)}...`, // Simplified summary
        metadata: { doc_id: docIds[i] },
    })
);

// Add the summary documents to the vector store for retrieval
await retriever.vectorstore.addDocuments(summaryDocs);

// Add the original, full documents to the document store
for (let i = 0; i < docs.length; i++) {
    await retriever.docstore.set(docIds[i], docs[i]);
}

// Step 5: Perform retrieval
const query = "what is langchain?";
const relevantDocs = await retriever.getRelevantDocuments(query);

console.error(relevantDocs);
/*
Output will contain the full original documents,
even though the search was performed on the summaries.
*/
