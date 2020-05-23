import { Teams } from "../codenames-core/models"

export const teamName = (team?: Teams) => (team === Teams.red ? "Red" : team === Teams.blue ? "Blue" : undefined)
