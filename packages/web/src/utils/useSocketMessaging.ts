import { Messages } from "@codenames50/messaging"
import React, { useEffect, useRef } from "react"
import io from "socket.io-client"

export type EmitMessage = <T extends {}>(message: Messages.GameMessage<T>) => void
export type AddMessageHandler = (handler: Messages.GameMessageHandler) => void

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

export const useSocketMessaging = (uri: string): [EmitMessage, AddMessageHandler] => {
  const { current: socket } = useRef(connect(uri))

  useEffect(() => () => disconnect(socket), [socket])

  return [React.useCallback(emitMessage(socket), []), React.useCallback(addMessageHandler(socket), [])]
}

export type SocketMessaging = ReturnType<typeof useSocketMessaging>
