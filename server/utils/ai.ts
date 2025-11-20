import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { PGVectorStore, type DistanceStrategy, } from "@langchain/community/vectorstores/pgvector";
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { InMemoryStore } from '@langchain/core/stores'
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed'
import { useDrizzle } from '~~/server/utils/drizzle'

export function getModel(model: 'google' | 'openai') {
  const config = useRuntimeConfig()
  switch (model) {
    case 'google':
      return new ChatGoogleGenerativeAI({
        temperature: 0,
        model: 'gemini-2.0-flash',
        streaming: true,
        apiKey: config.OPENAI_API_KEY
      })
    case 'openai':
      return new ChatOpenAI({
        temperature: 0.5,
        model: 'gpt-4o-mini',
        apiKey: config.OPENAI_API_KEY
        // streaming: true
      })
  }
}

export function getEmbedding(model: 'google' | 'openai') {
  const config = useRuntimeConfig()
  switch (model) {
    case 'google':
      return new GoogleGenerativeAIEmbeddings({
        model: 'embedding-001',
        apiKey: config.OPENAI_API_KEY
      })

    case 'openai':
      return new OpenAIEmbeddings({
        model: 'text-embedding-ada-002',
        apiKey: config.OPENAI_API_KEY
      })
  }
}

export function cachedEmbeddings(): CacheBackedEmbeddings {
  const underlyingEmbeddings = getEmbedding('openai')

  const inMemoryStore = new InMemoryStore<Uint8Array>()

  return CacheBackedEmbeddings.fromBytesStore(
    underlyingEmbeddings,
    inMemoryStore,
    {
      namespace: underlyingEmbeddings.model
    }
  )
}

export async function getVectorStore(): Promise<PGVectorStore> {
  const embedding = cachedEmbeddings()
  const db = useDrizzle()

  return await PGVectorStore.initialize(embedding, {
    pool: db.$client,
    tableName: 'documents_summary',
    columns: {
      idColumnName: "id",
      vectorColumnName: "embedding",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
    distanceStrategy: "cosine" as DistanceStrategy,
    chunkSize: 1536
  })
}
