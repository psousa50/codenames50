import React from "react"
import useSound from "use-sound"
import { SocketMessaging } from "./socketMessaging"
import * as Api from "./api/games"

export interface Environment {
  config: {
    soundOn: boolean
  }
  api: typeof Api
  useSound: typeof useSound
  toggleSound: () => void
  socketMessaging: SocketMessaging
}

export const defaultConfig = {
  soundOn: false,
}

const defaultEnvironment: Environment = {} as any

export const EnvironmentContext = React.createContext(defaultEnvironment)
