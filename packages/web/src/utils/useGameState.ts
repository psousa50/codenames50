import React from "react"
import { GamePort } from "@codenames50/core"
import { GameModels } from "@codenames50/core"
import { CodeNamesGame } from "@codenames50/core/dist/models"

type GameCallback = (game: CodeNamesGame) => void

export const useGameState = (): [GameModels.CodeNamesGame | undefined, typeof updateGame] => {
  const [game, setGame] = React.useState<GameModels.CodeNamesGame | undefined>()

  const checkResult = (port: GamePort, callback?: GameCallback) => (game: CodeNamesGame | undefined) => {
    const updatedGame = game ? port(game) : game
    const newGame = typeof updatedGame === "string" ? game : updatedGame
    if (callback && newGame) {
      callback(newGame)
    }
    return newGame
  }

  const updateGame = (gamePortOrGame: GamePort | GameModels.CodeNamesGame, callback?: GameCallback) => {
    if (typeof gamePortOrGame === "function") {
      setGame(checkResult(gamePortOrGame, callback))
    } else {
      setGame(gamePortOrGame)
    }
  }

  return [game, React.useCallback(updateGame, [])]
}
