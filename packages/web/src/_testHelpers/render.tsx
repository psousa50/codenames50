import { render } from "@testing-library/react"
import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
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
    <Switch>
      <Route path="/" exact={true} render={() => <ComponentWithRedirection />} />
      <Route path={redirectUrl} render={({ location: { pathname, search } }) => <div>{`${pathname}${search}`}</div>} />
    </Switch>
  </BrowserRouter>
)
