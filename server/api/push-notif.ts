import { sseEvent } from '~~/server/utils/sse'

let clients: Record<string, any>[] = [] // Array to store connected SSE clients

export default eventHandler(async (event) => {
  // Enable SSE endpoint
  setHeader(event, 'cache-control', 'no-cache')
  setHeader(event, 'connection', 'keep-alive')
  setHeader(event, 'content-type', 'text/event-stream')
  setResponseStatus(event, 200)

  clients.push(event.node.req)

  sseEvent.on('push:notif', (data) => {
    event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
    event.node.res.flushHeaders()
  })

  // Handle client disconnect
  event.node.req.on('close', () => {
    console.info('SSE client disconnected')

    clients = clients.filter(client => client !== event.node.req)

    sseEvent.removeListener('push:notif', (data) => {
      return { message: data.message }
    })
  })

  event._handled = true // Prevent further processing
})
