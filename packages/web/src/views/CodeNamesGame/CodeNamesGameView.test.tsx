import { render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { EnvironmentContext } from "../../environment"
import { actionOf } from "../../utils/actions"
import { CodeNamesGameView } from "./CodeNamesGameView"
import { GameStates } from "@codenames50/core/dist/models"

describe("CodeNamesGameView", () => {
  const defaultEnvironment = {
    config: {},
    api: {
      getLanguages: () => actionOf([]),
      getTurnTimeouts: () => actionOf([{ timeoutSec: 0 }]),
    },
  } as any

  const defaultGame = {
    config: {},
    gameId: "some-id",
    players: [],
    blueTeam: {},
    redTeam: {},
    hintWord: "",
    board: [],
  }

  it("displays the userId", async () => {
    const userId = "Some Name"

    const game = {
      gameId: "some-id",
      players: [],
      blueTeam: {},
      redTeam: {},
    }

    const props = {
      game,
      userId,
      error: "",
    } as any

    render(
      <EnvironmentContext.Provider value={defaultEnvironment}>
        <CodeNamesGameView {...props} />
      </EnvironmentContext.Provider>,
    )

    expect(await screen.findByText(userId)).toBeInTheDocument()
  })

  describe("when game is idle", () => {
    const idleGame = {
      ...defaultGame,
      state: GameStates.idle,
    }

    it("game setup should be expanded", async () => {
      const userId = "Some Name"

      const game = idleGame

      const props = {
        game,
        userId,
        error: "",
      } as any

      render(
        <EnvironmentContext.Provider value={defaultEnvironment}>
          <CodeNamesGameView {...props} />
        </EnvironmentContext.Provider>,
      )

      expect(await screen.findByText("Start Game")).toBeVisible()
    })

    it("shouldn't display the board nor the hints", async () => {
      const userId = "Some Name"

      const word = "SomeWord"
      const game = {
        ...idleGame,
        board: [[{ word }]],
      }

      const props = {
        game,
        userId,
        error: "",
      } as any

      render(
        <EnvironmentContext.Provider value={defaultEnvironment}>
          <CodeNamesGameView {...props} />
        </EnvironmentContext.Provider>,
      )

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

      const game = runningGame

      const props = {
        game,
        userId,
        error: "",
      } as any

      render(
        <EnvironmentContext.Provider value={defaultEnvironment}>
          <CodeNamesGameView {...props} />
        </EnvironmentContext.Provider>,
      )

      await waitFor(() => expect(screen.queryByText("New Game")).not.toBeVisible())
    })

    it("board and hint should be visible", async () => {
      const userId = "Some Name"

      const word = "SomeWord"
      const game = {
        ...runningGame,
        board: [[{ word }]],
      }

      const props = {
        game,
        userId,
        error: "",
      } as any

      render(
        <EnvironmentContext.Provider value={defaultEnvironment}>
          <CodeNamesGameView {...props} />
        </EnvironmentContext.Provider>,
      )

      const words = await screen.findAllByText(word, { exact: false })
      expect(words.length).toBeGreaterThan(0)
      expect(await screen.findByText("End Turn")).toBeVisible()
    })
  })
})
