import { GameStates } from "@codenames50/core/dist/models"
import { Messages } from "@codenames50/messaging"
import { screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { defaultEnvironment, renderWithEnvironment } from "../../../_testHelpers/render"
import { PlayGameScreen } from "../PlayGameScreen"
import { PlayGame } from "./PlayGame"

describe("PlayGame", () => {
  const userId = "Some Name"

  const defaultGame = {
    config: {},
    gameId: "some-id",
    players: [],
    blueTeam: {},
    redTeam: {},
    hintWord: "",
    board: [],
  }

  const propsFor = (game: any, userId: string = "Some name") =>
    ({
      game,
      userId,
      error: "",
    } as any)

  it("displays the userId", async () => {
    const props = propsFor(defaultGame, userId)

    renderWithEnvironment(<PlayGame {...props} />)

    expect(await screen.findByText(userId)).toBeInTheDocument()
  })

  describe("when game is idle", () => {
    const idleGame = {
      ...defaultGame,
      state: GameStates.idle,
    }

    it("game setup should be expanded", async () => {
      const userId = "Some Name"

      const props = propsFor(idleGame, userId)

      renderWithEnvironment(<PlayGame {...props} />)

      expect(await screen.findByText("Start Game")).toBeVisible()
    })

    it("shouldn't display the board nor the hints", async () => {
      const userId = "Some Name"

      const word = "SomeWord"
      const game = {
        ...idleGame,
        board: [[{ word }]],
      }

      const props = propsFor(game, userId)

      renderWithEnvironment(<PlayGame {...props} />)

      await waitFor(() => expect(screen.queryByText(word, { exact: false })).toBeNull())
      await waitFor(() => expect(screen.queryByText("End Turn")).toBeNull())
    })
  })

  describe("when game is running", () => {
    const runningGame = {
      ...defaultGame,
      state: GameStates.running,
    }

    it("game setup should be colapsed", async () => {
      const userId = "Some Name"

      const props = propsFor(runningGame, userId)

      renderWithEnvironment(<PlayGame {...props} />)

      await waitFor(() => expect(screen.queryByText("New Game")).not.toBeVisible())
    })

    it("board and hint should be visible", async () => {
      const userId = "Some Name"

      const word = "SomeWord"
      const game = {
        ...runningGame,
        board: [[{ word }]],
      }

      const props = propsFor(game, userId)

      renderWithEnvironment(<PlayGame {...props} />)

      const words = await screen.findAllByText(word, { exact: false })
      expect(words.length).toBeGreaterThan(0)
      expect(await screen.findByText("End Turn")).toBeVisible()
    })

    describe("when a word is clicked", () => {
      it("should emit a revealWord message", async () => {
        const emitMessage = jest.fn()
        const messageHandlers = {} as any
        const socketMessaging = {
          connect: () => {},
          disconnect: () => {},
          emitMessage: jest.fn(() => emitMessage),
          addMessageHandler: () => (handler: Messages.GameMessageHandler) => {
            messageHandlers[handler.type] = handler.handler
          },
        }

        const callMessagehandler = (messageType: Messages.GameMessageType) => messageHandlers[messageType]

        const environment = {
          ...defaultEnvironment,
          socketMessaging,
        } as any

        const game = {
          ...runningGame,
          board: [
            [{ word: "w00" }, { word: "w00" }],
            [{ word: "w10" }, { word: "w11" }],
          ],
        }

        const props = {
          gameId: game.gameId,
          userId,
        }

        renderWithEnvironment(<PlayGameScreen {...props} />, environment)

        act(() => callMessagehandler("joinedGame")({ game }))

        const word10 = await screen.findAllByText("w10", { exact: false })
        userEvent.click(word10[0])

        expect(emitMessage).toHaveBeenCalledWith(Messages.revealWord({ gameId: game.gameId, userId, row: 1, col: 0 }))
      })
    })
  })
})
