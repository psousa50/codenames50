import React from "react"
import * as GameActions from "codenames50-core/lib/main"
import { CodeNamesGame } from "codenames50-core/lib/models"

export const useGameState = (): [CodeNamesGame | undefined, typeof updateGame] => {
  const [game, setGame] = React.useState<CodeNamesGame | undefined>()

  const updateGame = (actionOrGame: GameActions.GameAction | CodeNamesGame) => {
    if (typeof actionOrGame === "function") {
      setGame(g => (g ? actionOrGame(g) : g))
    } else {
      setGame(actionOrGame)
    }
  }

  return [game, updateGame]
}
