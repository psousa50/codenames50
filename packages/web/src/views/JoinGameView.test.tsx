import { fireEvent, render } from "@testing-library/react"
import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { JoinGameView } from "./JoinGameView"

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

describe("JoinGameView", () => {
  it("join a game for a user and redirects to the game page", () => {
    const { container, getByTestId, getByRole } = render(
      <TestRedirect
        ComponentWithRedirection={() => <JoinGameView gameId="game-id" userId="some-user" />}
        redirectUrl={"/game"}
      />,
    )

    fireEvent.change(getByRole("textbox", { name: "Your Name" }), { target: { value: "Some Name" } })

    fireEvent.click(getByTestId("join-game-button"))

    expect(container.innerHTML).toEqual(expect.stringContaining("/game?gameId=game-id&amp;userId=Some Name"))
  })
})
