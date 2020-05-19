import { CodeNamesGame, Teams } from "./models"

export type GameAction = (game: CodeNamesGame) => CodeNamesGame

export const setSpyMaster = (userId: string): GameAction => game => ({
  ...game,
  spyMaster: userId,
})

export const changeTurn: GameAction = game => ({
  ...game,
  turn: game.turn === Teams.red ? Teams.blue : Teams.red,
})
