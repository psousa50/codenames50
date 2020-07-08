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
      state: GameStates.idle,
      config: {},
      gameId: "some-id",
      players: [],
      blueTeam: {},
      redTeam: {},
    }

    it("displays game setup", async () => {
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

      expect(await screen.findByText("Start Game")).toBeInTheDocument()
    })

    it("shouldn't display the board nor the hints", async () => {
      const userId = "Some Name"

      const word = "SomeWord"
      const game = {
        ...idleGame,
        hintWord: "",
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

      await waitFor(() => expect(screen.queryByText(word.toUpperCase())).toBeNull())
      await waitFor(() => expect(screen.queryByText("End Turn")).toBeNull())
    })
  })
})
