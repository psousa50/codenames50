import { selectWordMessage, spyMasterMessage, SocketMessageTemplate, SocketMessage } from "./messages"

const addMessageHandler = <T>(socket: SocketIO.Socket, message: SocketMessageTemplate<T>) => {
  socket.on(message.type, message.handler)
}

export const emitMessage = <T>(socket: SocketIO.Socket, message: SocketMessage<T>) => {
  socket.emit(message.type, message.data)
}

export const socketHandler = (socket: SocketIO.Socket) => {
  addMessageHandler(socket, selectWordMessage)
  addMessageHandler(socket, spyMasterMessage)

  emitMessage(socket, selectWordMessage({ userId: "asdadsf" }))
}
