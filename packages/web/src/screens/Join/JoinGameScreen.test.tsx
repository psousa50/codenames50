import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { JoinGameScreen } from "./JoinGameScreen"

interface TestRedirectProps {
  ComponentWithRedirection: React.ComponentType
  redirectUrl: string
}
const TestRedirect: React.FC<TestRedirectProps> = ({ ComponentWithRedirection, redirectUrl }) => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact={true} render={() => <ComponentWithRedirection />} />
      <Route path={redirectUrl} render={({ location: { pathname, search } }) => <div>{`${pathname}${search}`}</div>} />
    </Switch>
  </BrowserRouter>
)

describe("JoinGameScreen", () => {
  it("join a game for a user and redirects to the game page", () => {
    render(
      <TestRedirect
        ComponentWithRedirection={() => <JoinGameScreen gameId="game-id" userId="some-user" />}
        redirectUrl={"/game"}
      />,
    )

    fireEvent.change(screen.getByRole("textbox", { name: "Your Name" }), { target: { value: "Some Name" } })
    userEvent.click(screen.getByTestId("join-game-button"))

    const redirectUrl = screen.getByText("/game?gameId=game-id&userId=Some Name")
    expect(redirectUrl).toBeDefined()
  })
})
