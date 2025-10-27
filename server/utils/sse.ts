import { EventEmitter } from 'node:events';
import { v4 as uuid } from 'uuid'

export const sseEvent = new EventEmitter();

export const sseSend = function (event: string, data: Record<string, string>) {
    sseEvent.emit(event, {
        id: uuid(),
        ...data
    });
}