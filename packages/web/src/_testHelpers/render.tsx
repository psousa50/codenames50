import React from "react"
import { render } from "@testing-library/react"
import { EnvironmentContext, Environment } from "../environment"
import { actionOf } from "../utils/actions"

export const defaultEnvironment: Environment = {
  config: {},
  api: {
    getLanguages: () => actionOf([]),
    getTurnTimeouts: () => actionOf([{ timeoutSec: 0 }]),
  },
  useSound: () => [jest.fn()],
} as any

export const renderWithEnvironment = (ui: React.ReactElement, environment = defaultEnvironment) =>
  render(<EnvironmentContext.Provider value={environment}>{ui}</EnvironmentContext.Provider>)
