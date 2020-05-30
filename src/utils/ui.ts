import { Teams } from "../codenames-core/models"

export const teamName = (team?: Teams) =>
  team === Teams.red ? "Scarlett" : team === Teams.blue ? "Mustard" : undefined
