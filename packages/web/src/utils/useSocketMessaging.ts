import React from "react"
import { Messages } from "@codenames50/messaging"
import { useEffect, useRef } from "react"
import { EnvironmentContext } from "../environment"

export type EmitMessage = <T extends {}>(message: Messages.GameMessage<T>) => void
export type AddMessageHandler = (handler: Messages.GameMessageHandler) => void

export const useSocketMessaging = (uri: string): [EmitMessage, AddMessageHandler] => {
  const {
    socketMessaging: { connect, disconnect, emitMessage, addMessageHandler },
  } = React.useContext(EnvironmentContext)

  const { current: socket } = useRef(connect(uri, () => {}))

  useEffect(() => () => disconnect(socket))

  return [React.useCallback(emitMessage(socket), []), React.useCallback(addMessageHandler(socket), [])]
}
