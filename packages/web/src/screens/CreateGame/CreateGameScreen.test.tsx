import { Messages } from "@codenames50/messaging"
import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { buildEnvironment } from "../../_testHelpers/environment"
import { renderWithEnvironment, TestRedirect } from "../../_testHelpers/render"
import { CreateGameScreen } from "./CreateGameScreen"

describe("CreateGameScreen", () => {
  const userId = "Some Name"

  describe("when the user types a name and presses create game button", () => {
    const userTypesNameAndPressesCreateGameButton = async () => {
      const r = buildEnvironment()

      renderWithEnvironment(
        <TestRedirect ComponentWithRedirection={() => <CreateGameScreen />} redirectUrl={"/game"} />,
        r.environment,
      )

      await userEvent.type(screen.getByRole("textbox", { name: "Your Name" }), userId)
      await userEvent.click(screen.getByTestId("create-game-button"))

      return r
    }

    it("emits a message to create the game", async () => {
      const { emitMessage } = await userTypesNameAndPressesCreateGameButton()

      expect(emitMessage).toHaveBeenCalledTimes(1)
      expect(emitMessage).toHaveBeenCalledWith(Messages.createGame({ userId }))
    })

    it("redirects to the game page when the game is created", async () => {
      const { simulateMessageFromServer } = await userTypesNameAndPressesCreateGameButton()

      const gameId = "some-game-id"
      const game = { gameId, error: "" }
      act(() => simulateMessageFromServer(Messages.gameCreated(game)))

      const redirectUrl = screen.getByText(`/game?gameId=${gameId}&userId=${encodeURIComponent(userId)}`)
      expect(redirectUrl).toBeDefined()
    })
  })
})
