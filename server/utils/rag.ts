import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from '@langchain/core/prompts'
import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory } from '@langchain/core/runnables'
import { formatDocumentsAsString } from 'langchain/util/document'
import { getVectorStore, getModel } from '~~/server/utils/ai'
import { MultiQueryRetriever } from 'langchain/retrievers/multi_query'
import { z } from 'zod'
import { UIMessagePartSchema } from '#shared/types/chat'
import { BaseListChatMessageHistory } from '@langchain/core/chat_history'
import { BaseMessage } from '@langchain/core/messages'

/**
 * Returns a MultiVectorRetriever instance that is used to search for similar
 * documents in the vector store. It takes the vector store and byte store as
 * parameters, and also the id key of the documents, and the number of nearest
 * neighbors to retrieve for child and parent documents.
 * @returns {MultiVectorRetriever} - An instance of MultiVectorRetriever that can be used to search for similar documents.
 */
// export const getRetriever = (): MultiVectorRetriever => {
export const getRetriever = async (): Promise<MultiQueryRetriever> => {
  const vectorstore = await getVectorStore()
  const model = getModel('openai')

  return MultiQueryRetriever.fromLLM({
    llm: model,
    retriever: vectorstore.asRetriever()
  })
}

const getContextChain = async () => {
  const retriever = await getRetriever()

  return RunnableSequence.from([
    input => input.question,
    retriever,
    formatDocumentsAsString
  ])
}

export async function getAnswerChain() {
  const config = useRuntimeConfig()

  const storageUrl = resolveStoragePath('documents')

  //    - if the context contains a chart, add the answer format as <Chart> component in new line
  const ANSWER_TEMPLATE = `You're a helpful deep research AI assistant. 

    Given a user question, and context. 
    Your task is to provide detailed answer to the user's question based ONLY on the provided context include relevant table or image if needed
    if you are not sure with the answer, you can ask the user again to confirm the question

    - Get full filename from context metadata
    - Use the storage url base: ${storageUrl} to replace image links
    - Return the answer with markdown format
    - Always attach source of information at the end of the answer like document file name, page number, and line location in markdown link with url format: ${config.public.SITE_URL}/show?filename='filename from context metadata'&page=page-number&line=line-number as markdown link
    - if the context contains a table, add the answer format as table in Markdown use title case for heading in new line
    - if the context contains a formula, add the answer format as formula in Markdown katex in new line
    - if the context contains a list, add the answer format as Markdown lists in new line
    - if the context contains a image, replace the image base link with: ${storageUrl}/'filename without extension'/images/filename and return as markdown image format in new line
    - Answer in indonesian language

    Context
    {context}

    Answer:
    Source:
    `
  // - End the answer with __END__

  const answerPrompt = ChatPromptTemplate.fromMessages([
    ['system', ANSWER_TEMPLATE],
    new MessagesPlaceholder('history'),
    ['human', '{question}']
  ])


  const model = getModel('openai')

  // const answerChain = RunnableSequence.from([
  //   {
  //     question: new RunnablePassthrough()
  //   },
  //   RunnablePassthrough.assign({
  //     context: getContextChain
  //   }),
  //   answerPrompt,
  //   // PromptTemplate.fromTemplate(ANSWER_TEMPLATE),
  //   model.withStructuredOutput(UIMessagePartSchema),
  //   model,
  //   // new StringOutputParser()
  // ])
  return RunnableSequence.from([
    {
      question: new RunnablePassthrough(),
      history: async (input) => input.history as BaseMessage[],
    },
    RunnablePassthrough.assign({
      context: getContextChain,
    }),
    answerPrompt,
    model, //.withStructuredOutput(UIMessagePartSchema)
  ])

}
