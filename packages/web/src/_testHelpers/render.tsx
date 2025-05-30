import { render } from "@testing-library/react"
import React from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { EnvironmentContext } from "../environment"
import { defaultEnvironment } from "./environment"

export const renderWithEnvironment = (ui: React.ReactElement, environment = defaultEnvironment) =>
  render(<EnvironmentContext.Provider value={environment}>{ui}</EnvironmentContext.Provider>)

interface TestRedirectProps {
  ComponentWithRedirection: React.ComponentType
  redirectUrl: string
}

export const TestRedirect: React.FC<TestRedirectProps> = ({ ComponentWithRedirection, redirectUrl }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ComponentWithRedirection />} />
      <Route path={redirectUrl} element={<RedirectDisplay />} />
    </Routes>
  </BrowserRouter>
)

const RedirectDisplay: React.FC = () => {
  const location = useLocation()
  return <div>{`${location.pathname}${location.search}`}</div>
}
