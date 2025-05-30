import { GameModels } from "@codenames50/core"

export const teamName = (team?: GameModels.Teams) =>
  team === GameModels.Teams.red ? "Yellow" : team === GameModels.Teams.blue ? "Blue" : undefined
