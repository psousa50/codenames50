import { Messages } from "@codenames50/messaging"
import io from "socket.io-client"

export type AddMessageHandler = (handler: Messages.GameMessageHandler) => void
export type AddSocketMessageHandler = (socket: SocketIOClient.Socket) => AddMessageHandler

const connect = (uri: string) => io(uri, { autoConnect: true })

const disconnect = (socket: SocketIOClient.Socket) => {
  socket.removeAllListeners()
  socket.close()
}

const emitMessage = (socket: SocketIOClient.Socket) => (message: Messages.GameMessage) => {
  socket.emit(message.type, message.data)
}

const addMessageHandler = (socket: SocketIOClient.Socket) => (handler: Messages.GameMessageHandler) => {
  socket.removeListener(handler.type)
  socket.on(handler.type, handler.handler)
}

export const socketMessaging = {
  connect,
  disconnect,
  emitMessage,
  addMessageHandler,
}

export type SocketMessaging = typeof socketMessaging
