import { Messages } from "@codenames50/messaging"
import io from "socket.io-client"

const connect = (socket: SocketIOClient.Socket) => () => {
  if (!socket.connected) {
    console.log("Connecting=====>")
    socket.connect()
  } else {
    console.log("Already connected=====>")
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

  socket.on(handler.type, (data: any) => {
    console.log("RECEIVED:", handler.type)
    handler.handler(data)
  })
}

export const buildSocketMessaging = (uri: string) => {
  const socket = io(uri, { autoConnect: false })

  socket.on("connect", () => console.log("connect"))
  socket.on("disconnect", () => console.log("disconnect"))
  socket.on("connect_error", () => console.log("connect_error"))
  socket.on("connect_timeout", () => console.log("connect_timeout"))
  socket.on("reconnect_attempt", () => console.log("reconnect_attempt"))
  socket.on("reconnect_error", () => console.log("reconnect_error"))
  socket.on("reconnect_failed", () => console.log("reconnect_failed"))
  socket.on("reconnecting", () => console.log("reconnecting"))
  socket.on("reconnect", () => console.log("reconnect"))
  socket.on("ping", () => console.log("ping"))
  socket.on("pong", () => console.log("pong"))

  return {
    connect: connect(socket),
    emitMessage: emitMessage(socket),
    addMessageHandler: addMessageHandler(socket),
    disconnect: disconnect(socket),
  }
}
