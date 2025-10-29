import { markdownToHtml } from '~/utils/markdown';
export default defineEventHandler(async (event) => {
    const { question, uuid } = await readBody(event)

    console.log(question)
    // setHeaders(event, {
    //     "cache-control": "no-cache",
    //     "connection": "keep-alive",
    //     "content-type": "text/event-stream"
    // });

    try {
        //@ts-ignore
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
        const answer = await response.invoke(question)

        return {
            type: 'text',
            text: answer,
        }

    } catch (err) {
        setResponseStatus(event, 400, "Streaming Error")
        console.error("Streaming error:", err, typeof err);
        return {
            type: 'error',
            text: err
        }
    }
})

/* 

*/