import { Messages } from "@codenames50/messaging"
import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { buildEnvironment } from "../../_testHelpers/environment"
import { renderWithEnvironment, TestRedirect } from "../../_testHelpers/render"
import { CreateGameScreen } from "./CreateGameScreen"

describe("CreateGameScreen", () => {
  const userId = "Some Name"

  describe("when the user types a name and presses create game button", () => {
    const userTypesNameAndPressesCreateGameButton = () => {
      const r = buildEnvironment()

      renderWithEnvironment(
        <TestRedirect ComponentWithRedirection={() => <CreateGameScreen />} redirectUrl={"/game"} />,
        r.environment,
      )

      fireEvent.change(screen.getByRole("textbox", { name: "Your Name" }), { target: { value: userId } })
      userEvent.click(screen.getByTestId("create-game-button"))

      return r
    }

    it("emits a message to create the game", () => {
      const { emitMessage } = userTypesNameAndPressesCreateGameButton()

      expect(emitMessage).toHaveBeenCalledTimes(1)
      expect(emitMessage).toHaveBeenCalledWith(Messages.createGame({ userId }))
    })

    it("redirects to the game page when the game is created", async () => {
      const { simulateMessageFromServer } = userTypesNameAndPressesCreateGameButton()

      const gameId = "some-game-id"
      const game = { gameId, error: "" }
      act(() => simulateMessageFromServer(Messages.gameCreated(game)))

      const redirectUrl = screen.getByText(`/game?gameId=${gameId}&userId=${userId}`)
      expect(redirectUrl).toBeDefined()
    })
  })
})
