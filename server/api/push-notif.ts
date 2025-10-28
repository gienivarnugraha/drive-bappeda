import { sseEvent } from '../utils/sse';

let clients: Record<string, any>[] = []; // Array to store connected SSE clients

export default eventHandler(async (event) => {
    // Enable SSE endpoint
    setHeader(event, 'cache-control', 'no-cache')
    setHeader(event, 'connection', 'keep-alive')
    setHeader(event, 'content-type', 'text/event-stream')
    setResponseStatus(event, 200)

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
})