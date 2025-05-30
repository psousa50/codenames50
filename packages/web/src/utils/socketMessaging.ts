import { Messages } from "@codenames50/messaging"
import io from "socket.io-client"

const connect =
  (socket: SocketIOClient.Socket) =>
  (onConnect: () => void = () => {}) => {
    if (!socket.connected) {
      console.log("Connecting=====>")
      socket.on("connect", onConnect)
      socket.connect()
    } else {
      console.log("Already connected=====>")
      onConnect()
    }
  }

const disconnect = (socket: SocketIOClient.Socket) => () => {
  console.log("Disconnecting=====>")
  socket.removeAllListeners()
  socket.close()
}

const emitMessage = (socket: SocketIOClient.Socket) => (message: Messages.GameMessage) => {
  console.log("EMIT:", message.type)
  socket.emit(message.type, message.data)
}

const addMessageHandler = (socket: SocketIOClient.Socket) => (handler: Messages.GameMessageHandler) => {
  socket.removeListener(handler.type)

  socket.on(handler.type, (data: unknown) => {
    console.log("RECEIVED:", handler.type)
    handler.handler(data)
  })
}

export const buildSocketMessaging = (uri: string) => {
  const socket = io(uri, { autoConnect: false })

  return {
    connect: connect(socket),
    emitMessage: emitMessage(socket),
    addMessageHandler: addMessageHandler(socket),
    disconnect: disconnect(socket),
  }
}
