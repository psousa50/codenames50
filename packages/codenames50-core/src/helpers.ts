import { CodeNamesGame, Teams } from "./models"

export const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

export const otherTeam = (team?: Teams) =>
  team === Teams.red ? Teams.blue : team === Teams.blue ? Teams.red : undefined
