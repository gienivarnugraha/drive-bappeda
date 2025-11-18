import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from '@langchain/core/prompts'
import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory } from '@langchain/core/runnables'
import { formatDocumentsAsString } from 'langchain/util/document'
import { getVectorStore, getModel } from '~~/server/utils/ai'
import { MultiQueryRetriever } from 'langchain/retrievers/multi_query'
import { z } from 'zod'
import { H3Event } from 'h3';

const messageHistories: { [sessionId: string]: ChatMessageHistory } = {}

const getMessageHistoryForSession = (sessionId: string) => {
  if (messageHistories[sessionId] !== undefined) {
    return messageHistories[sessionId]
  }
  const newChatSessionHistory = new ChatMessageHistory()

  messageHistories[sessionId] = newChatSessionHistory

  return newChatSessionHistory
}

/**
 * Returns a MultiVectorRetriever instance that is used to search for similar
 * documents in the vector store. It takes the vector store and byte store as
 * parameters, and also the id key of the documents, and the number of nearest
 * neighbors to retrieve for child and parent documents.
 * @returns {MultiVectorRetriever} - An instance of MultiVectorRetriever that can be used to search for similar documents.
 */
// export const getRetriever = (): MultiVectorRetriever => {
export const getRetriever = async (event: H3Event): Promise<MultiQueryRetriever> => {
  const vectorstore = await getVectorStore(event)
  const model = getModel(event, 'google')

  return MultiQueryRetriever.fromLLM({
    llm: model,
    retriever: vectorstore.asRetriever()
  })
}

const getContextChain = async (event: H3Event,) => {
  const retriever = await getRetriever(event)

  return RunnableSequence.from([
    input => input.question,
    retriever,
    formatDocumentsAsString
  ])
}

export function generateAnswerFromDocument(event: H3Event,) {

  const config = useRuntimeConfig()

  //    - if the context contains a chart, add the answer format as <Chart> component in new line
  const ANSWER_TEMPLATE = `You're a helpful deep research AI assistant. 

    Given a user question, and context. 
    Your task is to provide detailed answer to the user's question based ONLY on the provided context include relevant table or image if needed
    if you are not sure with the answer, you can ask the user again to confirm the question

    - Return the answer with markdown format
    - Always attach source of information at the end of the answer like document file name, page number, and line location in markdown link with url format: ${config.public.SITE_URL}/show?filename=filename&page=page-number&line=line-number as markdown link
    - if the context contains a table, add the answer format as table in Markdown use title case for heading in new line
    - if the context contains a formula, add the answer format as formula in Markdown katex in new line
    - if the context contains a list, add the answer format as Markdown lists in new line
    - if the context contains a image, replace the image base link with: ${config.public.storageUrl} and return as markdown image format in new line
    - Answer in indonesian language

    Context
    {context}

    Question: 
    {question}

    Answer:
    Source:
    `
  // - End the answer with __END__

  const answerPrompt = ChatPromptTemplate.fromMessages([
    ['system', ANSWER_TEMPLATE],
    // new MessagesPlaceholder("history"),
    new MessagesPlaceholder('question'),
    new MessagesPlaceholder('context')
  ])


  const model = getModel(event, 'google')


  // Use z.discriminatedUnion for the best performance and type inference in TypeScript
  const OutputSchema = z.array(z.discriminatedUnion('type', [
    z.object({
      type: z.literal('text'),
      text: z.string()
    }).describe('text answer'),
    z.object({
      type: z.literal('image'),
      src: z.string().url() // Assuming src should be a URL
    }).describe('display image attachment'),
    z.object({
      type: z.literal('chart'),
      data: z.object({
        value: z.array(z.number()),
        label: z.array(z.string())
      })
    }).describe('display chart attachment'),
    z.object({
      type: z.literal('formula'),
      name: z.string(),
      formula: z.string()
    }).describe('display formula attachment'),
    z.object({
      type: z.literal('start')
    }).describe('start of conversation'),
    z.object({
      type: z.literal('end')
    }).describe('end of conversation')
  ])
  )

  const schema = z.object({
    type: z.enum(['text', 'chart', 'formula']),
    text: z.string().describe('provide answer')
  })

  const answerChain = RunnableSequence.from([
    {
      question: new RunnablePassthrough()
    },
    RunnablePassthrough.assign({
      context: getContextChain
    }),
    answerPrompt,
    // PromptTemplate.fromTemplate(ANSWER_TEMPLATE),
    // model.withStructuredOutput(schema),
    model,
    new StringOutputParser()
  ])

  return answerChain

  // const finalRetrievalChain = new RunnableWithMessageHistory({
  //   runnable: answerChain,
  //   getMessageHistory: getMessageHistoryForSession,
  //   inputMessagesKey: "question",
  //   historyMessagesKey: "history",
  // })

  // return finalRetrievalChain;
}
