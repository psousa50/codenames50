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
    callback && newGame && callback(newGame)
    return newGame
  }

  const updateGame = (portOrGame: GamePort | GameModels.CodeNamesGame, callback?: GameCallback) => {
    if (typeof portOrGame === "function") {
      setGame(checkResult(portOrGame, callback))
    } else {
      setGame(portOrGame)
    }
  }

  return [game, updateGame]
}
