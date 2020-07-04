import useSound from "use-sound"
import React from "react"
import { EmitMessage } from "./utils/types"
import { AddMessageHandler } from "./utils/useSocketMessaging"

export type SocketMessaging = (uri: string, onConnect: () => void) => [EmitMessage, AddMessageHandler]

export interface Environment {
  config: {
    soundOn: boolean
  }
  useSound: typeof useSound
  toggleSound: () => void
  useSocketMessaging: SocketMessaging
}

export const defaultConfig = {
  soundOn: false,
}

const defaultEnvironment: Environment = {} as any

export const EnvironmentContext = React.createContext(defaultEnvironment)
