import { GameStates } from "@codenames50/core/dist/models"
import { screen, waitFor } from "@testing-library/react"
import React from "react"
import { defaultEnvironment, renderWithEnvironment } from "../../_testHelpers/render"
import { CodeNamesGameView } from "./CodeNamesGameView"

describe("CodeNamesGameView", () => {
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

    renderWithEnvironment(<CodeNamesGameView {...props} />)

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

      renderWithEnvironment(<CodeNamesGameView {...props} />)

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

      renderWithEnvironment(<CodeNamesGameView {...props} />)

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

      renderWithEnvironment(<CodeNamesGameView {...props} />)

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

      renderWithEnvironment(<CodeNamesGameView {...props} />)

      const words = await screen.findAllByText(word, { exact: false })
      expect(words.length).toBeGreaterThan(0)
      expect(await screen.findByText("End Turn")).toBeVisible()
    })
  })
})
