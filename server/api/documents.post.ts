import { setVectorStore } from '~/utils/scripts/init';
import { sseEvent } from '../utils/sse';

type Schema = {
    filenames: string[],
    category_id: number[],
    division_id: number[],
}

const documentPath = process.env.DOCUMENT_PATH ?? '';

if (!documentPath) {
    throw new Error('DOCUMENT_PATH environment variable is not set.');
}

let clients: Record<string, any>[] = []; // Array to store connected SSE clients

export default eventHandler(async (event) => {
    // Enable SSE endpoint
    setHeader(event, 'cache-control', 'no-cache')
    setHeader(event, 'connection', 'keep-alive')
    setHeader(event, 'content-type', 'text/event-stream')
    setResponseStatus(event, 200)

    sseSend("push:notif", { message: 'done uploading', })

    const data = await readBody<Schema>(event);

    console.log(data)

    const storage = useStorage('documents');

    const { filenames, ...rest } = data


    for (const filename of filenames) {
        console.log('hasItem:', filename, await storage.hasItem(filename))

        sseSend("push:notif", { message: `processing file... ${filename}`, })
        // The following line calls setVectorStore to store vectors for each document.
        // If you need to disable this for testing or performance reasons, comment it out.
        //await setVectorStore(`${documentPath}/${filename}`, rest)
    }

    const stream = new ReadableStream({
        start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(JSON.stringify(data));
            };

            // Listen for 'dataUpdate' events and push them to the client
            sseEvent.on('push:notif', (data) => {
                console.log('SSE send event:', data);
                sendEvent(data);
            });

            // Handle client disconnect
            event.node.req.on('close', () => {
                console.log('SSE client disconnected');
                sseEvent.removeListener('push:notif', sendEvent);
                controller.close();
            });
        },
    });


    return stream;




    // sseEvent.on('push:notif', async (data: Record<string, string>) => {
    //     await eventStream.push({ event: 'update', data: JSON.stringify(data) });
    // });


    // // cleanup the interval and close the stream when the connection is terminated
    // eventStream.onClosed(async () => {
    //     console.log("closing SSE...");
    //     clearInterval(interval);
    //     clients = clients.filter((client) => client !== eventStream); // Remove the client when it disconnects
    //     await eventStream.close();
    // });

    // event._handled = true

    // return eventStream.send();

})