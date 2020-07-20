import { Messages } from "@codenames50/messaging"
import io from "socket.io-client"

const connect = (uri: string) => {
  console.log("Connecting=====>", uri)
  return io(uri, { autoConnect: true })
}

const disconnect = (socket: SocketIOClient.Socket) => () => {
  socket.removeAllListeners()
  socket.close()
}

const emitMessage = (socket: SocketIOClient.Socket) => (message: Messages.GameMessage) => {
  console.log("EMIT:", message.type)
  socket.emit(message.type, message.data)
}

const addMessageHandler = (socket: SocketIOClient.Socket) => (handler: Messages.GameMessageHandler) => {
  socket.removeListener(handler.type)

  socket.on(handler.type, (data: any) => {
    console.log("RECEIVED:", handler.type)
    handler.handler(data)
  })
}

export const buildSocketMessaging = (uri: string) => {
  const socket = connect(uri)

  return {
    emitMessage: emitMessage(socket),
    addMessageHandler: addMessageHandler(socket),
    disconnect: disconnect(socket),
  }
}
