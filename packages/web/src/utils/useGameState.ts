import React from "react"
import { GameActions } from "@codenames50/core"
import { GameModels } from "@codenames50/core"

export const useGameState = (): [GameModels.CodeNamesGame | undefined, typeof updateGame] => {
  const [game, setGame] = React.useState<GameModels.CodeNamesGame | undefined>()

  const updateGame = (actionOrGame: GameActions.GameAction | GameModels.CodeNamesGame) => {
    if (typeof actionOrGame === "function") {
      setGame(g => (g ? actionOrGame(g) : g))
    } else {
      setGame(actionOrGame)
    }
  }

  return [game, updateGame]
}
