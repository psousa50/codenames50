import React from "react"
import useSound from "use-sound"
import * as Api from "./api/games"
import { socketMessaging } from "./socketMessaging"

type EnvironmentConfig = {
  soundOn: boolean
}

export const defaultConfig = {
  soundOn: false,
}

export const readConfig = () => JSON.parse(localStorage.getItem("config") || JSON.stringify(defaultConfig))
export const writeConfig = (config: EnvironmentConfig) => localStorage.setItem("config", JSON.stringify(config))

export const defaultEnvironment = {
  api: Api,
  config: defaultConfig,
  useSound,
  toggleSound: () => {},
  socketMessaging,
}

export type Environment = typeof defaultEnvironment

export const updateConfig = (config: EnvironmentConfig) => (environment: Environment) => {
  const newEnvironment = {
    ...environment,
    config: {
      ...environment.config,
      config,
    },
  }

  writeConfig(newEnvironment.config)

  return newEnvironment
}

export const EnvironmentContext = React.createContext(defaultEnvironment)
