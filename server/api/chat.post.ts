import { getAnswerChain } from '~~/server/utils/rag'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { AIMessage } from '@langchain/core/messages';
import { UIMessagePart } from '~~/shared/types/chat';

const messageHistories: { [sessionId: string]: InMemoryChatMessageHistory } = {} as { [sessionId: string]: InMemoryChatMessageHistory };

export const getMessageHistoryForSession = (sessionId: string): InMemoryChatMessageHistory => {
  if (messageHistories[sessionId] !== undefined) {
    return messageHistories[sessionId];
  }
  const newChatSessionHistory = new InMemoryChatMessageHistory();

  messageHistories[sessionId] = newChatSessionHistory;

  return newChatSessionHistory;
};


export default defineEventHandler(async (event) => {
  const { question, uuid } = await readBody(event)

  console.info(question)

  // Create abort controller for this request
  const controller = new AbortController()
  const signal = controller.signal

  event.node.req.on('close', () => {
    console.info('Client disconnected')
    controller.abort()
  })

  event.node.req.on('aborted', () => {
    console.info('Request aborted')
    controller.abort()
  })

  event.node.res.on('aborted', () => {
    console.info('response aborted')
    controller.abort()
  })

  try {
    await getMessageHistoryForSession(uuid).addUserMessage(question)

    const answerChain = await getAnswerChain()

    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: answerChain,
      getMessageHistory: () => getMessageHistoryForSession(uuid),
      inputMessagesKey: 'question',
      historyMessagesKey: 'history'
    })

    const answer: AIMessage = await chainWithHistory.invoke({ question }, { signal, configurable: { sessionId: uuid } })

    await getMessageHistoryForSession(uuid).addAIMessage(answer.content as string)

    return {
      id: answer.id,
      type: 'text',
      text: answer.content
    } as UIMessagePart

    // const readable = new ReadableStream({
    //     async pull(controller) {
    //         for await (const message of await response.stream(question, {
    //             configurable: { sessionId: uuid },
    //         })) {
    //             console.error(message)
    //             // @ts-ignore
    //             if (message.type === 'end') {

    //                 // @ts-ignore
    //                 let end = message.replace('__END__', '')

    //                 controller.enqueue(end);

    //                 controller.close();
    //                 break
    //             }

    //             controller.enqueue(message);
    //         }

    //     }
    // });

    // return readable

  } catch (err: any) {
    if (err.message === 'Aborted') {
      console.error('Streaming aborted:', err, typeof err)
      return {
        type: 'error',
        text: 'Aborted'
      }
    } else {
      setResponseStatus(event, 400, 'Streaming Error')
      console.error('Streaming error:', err, typeof err)
      return {
        type: 'error',
        text: err
      }
    }
  }
})

/*

*/
