import React from "react"
import useSound from "use-sound"
import * as Api from "./api/games"
import { buildSocketMessaging } from "./utils/socketMessaging"

type EnvironmentConfig = {
  soundOn: boolean
}

const defaultConfig: EnvironmentConfig = {
  soundOn: false,
}

const readConfig = () => JSON.parse(localStorage.getItem("config") || JSON.stringify(defaultConfig))
const writeConfig = (config: EnvironmentConfig) => localStorage.setItem("config", JSON.stringify(config))

const buildEnvironment = () => ({
  api: Api,
  config: readConfig(),
  useSound,
  toggleSound: () => {},
  socketMessaging: {
    ...buildSocketMessaging(process.env.REACT_APP_SERVER_URL || ""),
  },
})

const updateConfig = (config: EnvironmentConfig) => (environment: Environment) => {
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

export const useEnvironment = () => {
  const [environment, setEnvironment] = React.useState(buildEnvironment())

  const toggleSound = () => {
    setEnvironment(env => updateConfig({ soundOn: !env.config.soundOn })(env))
  }

  return {
    ...environment,
    toggleSound,
  }
}

export type Environment = ReturnType<typeof buildEnvironment>

export const EnvironmentContext = React.createContext({} as Environment)
