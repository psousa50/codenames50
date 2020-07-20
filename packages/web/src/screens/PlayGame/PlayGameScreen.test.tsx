import { GameModels, gamePorts } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import { Types } from "@psousa50/shared"
import { act, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as R from "ramda"
import React from "react"
import { renderWithEnvironment } from "../../_testHelpers/render"
import { buildEnvironment } from "../../_testHelpers/environment"
import { PlayGameScreen } from "./PlayGameScreen"
import { Teams } from "./components/Teams"

describe("PlayGameScreen", () => {
  const userId = "Some Name"
  const gameId = "some-game-id"

  const renderPlayGameScreen = (partialGame: Types.DeepPartial<GameModels.CodeNamesGame>) => {
    const r = buildEnvironment()

    const game = R.mergeDeepRight(gamePorts.createGame(gameId, userId, Date.now()), partialGame)

    renderWithEnvironment(<PlayGameScreen gameId={gameId} userId={userId} />, r.environment)

    return { ...r, game }
  }

  const renderPlayGameScreenAndJoinGame = (partialGame: Types.DeepPartial<GameModels.CodeNamesGame>) => {
    const r = renderPlayGameScreen(partialGame)

    act(() => r.simulateMessageFromServer(Messages.joinedGame({ game: r.game, userId })))

    return r
  }

  it("on server connection emits messages to join the game", async () => {
    const { emitMessage, environment, simulateMessageFromServer } = buildEnvironment()

    renderWithEnvironment(<PlayGameScreen gameId={gameId} userId={userId} />, environment)

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    expect(screen.queryByText(userId)).toBeNull()

    expect(emitMessage).toHaveBeenCalledTimes(1)
    expect(emitMessage).toHaveBeenCalledWith(Messages.joinGame({ gameId, userId }))

    const game = gamePorts.createGame(gameId, userId, Date.now())
    act(() => simulateMessageFromServer(Messages.joinedGame({ game, userId })))

    await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
    expect(screen.queryAllByText(userId).length).toBeGreaterThan(0)
  })

  describe("when game is idle", () => {
    it("game setup should be expanded", async () => {
      const partialGame = {
        state: GameModels.GameStates.idle,
      }

      renderPlayGameScreenAndJoinGame(partialGame)

      expect(await screen.findByText("Start Game")).toBeVisible()
    })

    it("shouldn't display the board nor the hints", async () => {
      const word = "SomeWord"
      const partialGame = {
        state: GameModels.GameStates.idle,
        board: [[{ word }]],
      }

      renderPlayGameScreenAndJoinGame(partialGame)

      await waitFor(() => expect(screen.queryByText(word, { exact: false })).not.toBeInTheDocument())
      await waitFor(() => expect(screen.queryByText("End Turn")).not.toBeInTheDocument())
    })
  })

  describe("when the game is running", () => {
    it("game setup should be colapsed", async () => {
      const partialGame = {
        state: GameModels.GameStates.idle,
      }

      renderPlayGameScreenAndJoinGame(partialGame)

      await waitFor(() => expect(screen.queryByText("New Game")).not.toBeInTheDocument())
    })

    it("SpyMaster send's a SendHint Message", async () => {
      const partialGame = {
        state: GameModels.GameStates.running,
        redTeam: {
          spyMaster: userId,
        },
        hintWordCount: 0,
        players: [{ userId, team: GameModels.Teams.red }],
        turn: GameModels.Teams.red,
        turnStartedTime: 123,
      }

      const { emitMessage } = renderPlayGameScreenAndJoinGame(partialGame)

      const hintWord = "SomeHint"
      userEvent.type(screen.getByRole("textbox", { name: "Hint Word" }), hintWord)
      userEvent.click(screen.getByRole("button", { name: "2" }))
      userEvent.click(screen.getByRole("button", { name: "Send Hint" }))

      await waitFor(() =>
        expect(emitMessage).toHaveBeenCalledWith(Messages.sendHint({ gameId, userId, hintWord, hintWordCount: 2 })),
      )
    })

    describe("when a word is clicked", () => {
      it.only("should emit a revealWord message", async () => {
        const partialGame = {
          state: GameModels.GameStates.running,
          players: [{ userId, team: GameModels.Teams.red }],
          turn: GameModels.Teams.red,
          hintWord: "SomeWord",
          hintWordCount: 2,
          board: [
            [{ word: "w00" }, { word: "w00" }],
            [{ word: "w10" }, { word: "w11" }],
          ],
        }

        const { emitMessage } = renderPlayGameScreenAndJoinGame(partialGame)

        const word10 = await screen.findAllByText("w10", { exact: false })
        userEvent.click(word10[0])

        expect(emitMessage).toHaveBeenCalledWith(Messages.revealWord({ gameId, userId, row: 1, col: 0 }))
      })
    })
  })
})
