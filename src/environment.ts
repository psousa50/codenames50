import React from "react"

export interface Environment {
  soundOn: boolean
  toggleSound: () => void
}

const defaultEnvironment: Environment = {
  soundOn: false,
  toggleSound: () => undefined,
}

export const EnvironmentContext = React.createContext(defaultEnvironment)
