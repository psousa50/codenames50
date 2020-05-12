import { selectWordMessage, spyMasterMessage, SocketMessageTemplate } from "./messages"

const addMessageHandler = <T>(socket: SocketIO.Socket, message: SocketMessageTemplate<T>) => {
  socket.on(message.type, message.handler)
}

export const emitMessage = <T>(socket: SocketIO.Socket, message: SocketMessageTemplate<T>, data: T) => {
  socket.emit(message.type, message.createMessage(data))
}

export const socketHandler = (socket: SocketIO.Socket) => {
  addMessageHandler(socket, selectWordMessage)
  addMessageHandler(socket, spyMasterMessage)
}
