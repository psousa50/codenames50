import React from "react"
import useSound from "use-sound"
import * as Api from "./api/games"
import { buildSocketMessaging } from "./utils/socketMessaging"

export type EnvironmentConfig = {
  soundOn: boolean
}

const defaultConfig: EnvironmentConfig = {
  soundOn: false,
}

export const readConfig = () => JSON.parse(localStorage.getItem("config") || JSON.stringify(defaultConfig))
export const writeConfig = (config: EnvironmentConfig) => localStorage.setItem("config", JSON.stringify(config))

export const buildEnvironment = (config: EnvironmentConfig, toggleSound: () => void) => ({
  api: Api,
  config,
  useSound,
  toggleSound,
  socketMessaging: {
    ...buildSocketMessaging(process.env.REACT_APP_SERVER_URL || ""),
  },
})

export type Environment = ReturnType<typeof buildEnvironment>

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

export const EnvironmentContext = React.createContext<Environment>({} as Environment)
