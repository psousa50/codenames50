import { GameMessage, GameMessageType } from "../server/messaging/messages"

export const addMessageHandler = <T>(
  socket: SocketIOClient.Socket,
  type: GameMessageType,
  handler: (data: T) => void,
) => {
  socket.on(type, (data: T) => {
    console.log("RECEIVED=====>\n", type, data)
    handler(data)
  })
}

export const emitMessage = <T>(socket: SocketIOClient.Socket, message: GameMessage<T>) => {
  console.log("EMIT=====>\n", message)
  socket.emit(message.type, message.data)
}
