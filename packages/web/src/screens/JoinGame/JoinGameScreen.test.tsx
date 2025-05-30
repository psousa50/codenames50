import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { TestRedirect } from "../../_testHelpers/render"
import { JoinGameScreen } from "./JoinGameScreen"

describe("JoinGameScreen", () => {
  it("join a game for a user and redirects to the game page", () => {
    const userName = "Some Name"

    render(
      <TestRedirect
        ComponentWithRedirection={() => <JoinGameScreen gameId="game-id" userId="some-user" />}
        redirectUrl={"/game"}
      />,
    )

    fireEvent.change(screen.getByRole("textbox", { name: "Your Name" }), { target: { value: userName } })
    userEvent.click(screen.getByTestId("join-game-button"))

    const redirectUrl = screen.getByText(`/game?gameId=game-id&userId=${encodeURIComponent(userName)}`)
    expect(redirectUrl).toBeDefined()
  })
})
