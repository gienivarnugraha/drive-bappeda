import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import supabase from "./supabase";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { InMemoryStore } from "@langchain/core/stores";
import { CacheBackedEmbeddings } from "langchain/embeddings/cache_backed";

export function getModel(model: 'google' | 'openai') {
    switch (model) {
        case 'google':
            return new ChatGoogleGenerativeAI({
                temperature: 0,
                model: "gemini-2.0-flash",
                streaming: true
            });
        case 'openai':
            return new ChatOpenAI({
                temperature: 0,
                model: "gpt-4o-mini",
                streaming: true
            });
    }

}

export function getEmbedding(model: 'google' | 'openai') {
    switch (model) {
        case 'google':
            return new GoogleGenerativeAIEmbeddings({
                model: "embedding-001",
            });

        case 'openai':
            return new OpenAIEmbeddings({
                model: "text-embedding-ada-002",
            });
    }
}

export function cachedEmbeddings(): CacheBackedEmbeddings {

    const underlyingEmbeddings = getEmbedding('openai');

    const inMemoryStore = new InMemoryStore<Uint8Array>();

    return CacheBackedEmbeddings.fromBytesStore(
        underlyingEmbeddings,
        inMemoryStore,
        {
            namespace: underlyingEmbeddings.model,
        }
    );
}

export function getVectorStore(): SupabaseVectorStore {

    const embedding = cachedEmbeddings()

    return new SupabaseVectorStore(embedding, {
        client: supabase,
        tableName: 'documents_summary',
        queryName: 'match_documents'
    })
}

