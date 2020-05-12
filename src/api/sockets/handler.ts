import { SocketMessage, SocketMessageType } from "./messagesTypes"

export const addMessageHandler = <T>(
  socket: SocketIOClient.Socket,
  type: SocketMessageType,
  handler: (data: T) => void,
) => {
  socket.on(type, (data: T) => {
    console.log("RECEIVED=====>\n", type, data)
    handler(data)
  })
}

export const emitMessage = <T>(socket: SocketIOClient.Socket, message: SocketMessage<T>) => {
  console.log("EMIT=====>\n", message)
  socket.emit(message.type, message.data)
}
