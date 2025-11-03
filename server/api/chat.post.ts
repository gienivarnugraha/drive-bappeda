import { generateAnswerFromDocument } from '~/utils/rag'

export default defineEventHandler(async (event) => {
  const { question, uuid } = await readBody(event)

  console.log(question)

  // Create abort controller for this request
  const controller = new AbortController()
  const signal = controller.signal

  event.node.req.on('close', () => {
    console.log('Client disconnected')
    controller.abort()
  })

  event.node.req.on('aborted', () => {
    console.log('Request aborted')
    controller.abort()
  })

  try {
    // @ts-ignore
    // const response = await generateAnwserFromDB()
    const response = generateAnswerFromDocument()

    // const readable = new ReadableStream({
    //     async pull(controller) {
    //         for await (const message of await response.stream(question, {
    //             configurable: { sessionId: uuid },
    //         })) {
    //             console.log(message)
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
    const answer = await response.invoke(question, { signal })

    return {
      type: 'text',
      text: answer
    }
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
