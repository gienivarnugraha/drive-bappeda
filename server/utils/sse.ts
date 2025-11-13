import { EventEmitter } from 'node:events'
import { v4 as uuid } from 'uuid'

export const sseEvent = new EventEmitter()

type Data = {
  message: string
  id: string
  status: | 'info' | 'error' | 'success'
}

export const sseSend = function (event: string, data?: Omit<Data, 'id'>) {
  console.log('SSE:', data?.status, data?.message)

  sseEvent.emit<Data>(event, {
    id: uuid(),
    ...data
  })
}
