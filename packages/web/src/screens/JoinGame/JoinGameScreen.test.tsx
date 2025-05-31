import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { Messages } from "@codenames50/messaging"
import { buildEnvironment } from "../../_testHelpers/environment"
import { renderWithEnvironment, TestRedirect } from "../../_testHelpers/render"
import { JoinGameScreen } from "./JoinGameScreen"

describe("JoinGameScreen", () => {
  it("join a game for a user and redirects to the game page", () => {
    const userName = "Some Name"
    const gameId = "game-id"
    const { environment, simulateMessageFromServer } = buildEnvironment()

    renderWithEnvironment(
      <TestRedirect
        ComponentWithRedirection={() => <JoinGameScreen gameId={gameId} userId="some-user" />}
        redirectUrl={"/game"}
      />,
      environment,
    )

    fireEvent.change(screen.getByRole("textbox", { name: "Your Name" }), { target: { value: userName } })
    userEvent.click(screen.getByTestId("join-game-button"))

    // Simulate server response that sets the game state, triggering redirect
    const game = { gameId, players: [{ userId: userName }] }
    act(() => simulateMessageFromServer(Messages.joinedGame({ game, userId: userName })))

    const redirectUrl = screen.getByText(`/game?gameId=${gameId}&userId=${encodeURIComponent(userName)}`)
    expect(redirectUrl).toBeDefined()
  })
})
