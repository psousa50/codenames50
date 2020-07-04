import io from "socket.io-client"
import { Messages } from "@codenames50/messaging"
import { useEffect, useRef } from "react"

export type EmitMessage = <T extends {}>(message: Messages.GameMessage<T>) => void
export type EmitSocketMessage = (socket: SocketIOClient.Socket) => EmitMessage

export type AddMessageHandler = (handler: Messages.GameMessageHandler) => void
export type AddSocketMessageHandler = (socket: SocketIOClient.Socket) => AddMessageHandler

export const emitSocketMessage: EmitSocketMessage = socket => message => socket.emit(message.type, message.data)
export const addSocketMessageHandler: AddSocketMessageHandler = socket => handler => {
  socket.on(handler.type, handler.handler)
}

export const useSocketMessaging = (uri: string, onConnect: () => void): [EmitMessage, AddMessageHandler] => {
  const { current: socket } = useRef(io(uri, { autoConnect: true }))

  useEffect(() => {
    socket.on("connect", onConnect)
    return () => {
      socket.removeAllListeners()
      socket.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])

  return [emitSocketMessage(socket), addSocketMessageHandler(socket)]
}
