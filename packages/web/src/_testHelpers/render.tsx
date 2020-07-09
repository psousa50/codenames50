import { render } from "@testing-library/react"
import React from "react"
import { EnvironmentContext } from "../environment"
import { defaultEnvironment } from "./environment"

export const renderWithEnvironment = (ui: React.ReactElement, environment = defaultEnvironment) =>
  render(<EnvironmentContext.Provider value={environment}>{ui}</EnvironmentContext.Provider>)
