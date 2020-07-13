import React from "react"
import useSound from "use-sound"
import * as Api from "./api/games"
import { Messages } from "@codenames50/messaging"

export type EnvironmentConfig = {
  soundOn: boolean
}

export const defaultConfig: EnvironmentConfig = {
  soundOn: false,
}

export const readConfig = () => JSON.parse(localStorage.getItem("config") || JSON.stringify(defaultConfig))
export const writeConfig = (config: EnvironmentConfig) => localStorage.setItem("config", JSON.stringify(config))

export const defaultEnvironment = {
  api: Api,
  config: defaultConfig,
  useSound,
  toggleSound: () => {},
  socketMessaging: {
    emitMessage: (message: Messages.GameMessage) => {},
    addMessageHandler: (handler: Messages.GameMessageHandler) => {},
  },
}

export type Environment = typeof defaultEnvironment

export const updateConfig = (config: EnvironmentConfig) => (environment: Environment) => {
  const newEnvironment = {
    ...environment,
    config: {
      ...environment.config,
      ...config,
    },
  }

  writeConfig(newEnvironment.config)

  return newEnvironment
}

export const EnvironmentContext = React.createContext(defaultEnvironment)
