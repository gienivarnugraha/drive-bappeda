
export default defineEventHandler(async (event) => {
    const { question, uuid } = await readBody(event)

    console.log(question)
    // setHeaders(event, {
    //     "cache-control": "no-cache",
    //     "connection": "keep-alive",
    //     "content-type": "text/event-stream"
    // });

    event.node.req.on('close', () => {
        console.log('Client disconnected');
    });

    event.node.req.on('aborted', () => {
        console.log('Request aborted');
        // reject(new Error('Aborted')); // Reject the promise on abort
    });

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

    } catch (err: H3Error) {
        if (err.message === 'Aborted') {
            setResponseStatus(event, 400, "Streaming Error")
            console.error("Streaming error:", err, typeof err);
            return {
                type: 'error',
                text: 'Aborted'
            }
        } else {
            setResponseStatus(event, 400, "Streaming Error")
            console.error("Streaming error:", err, typeof err);
            return {
                type: 'error',
                text: err
            }
        }

    }
})

/* 

*/