import { Teams } from "../codenames-core/models"

export const teamName = (team?: Teams) => (team === Teams.red ? "Yellow" : team === Teams.blue ? "Blue" : undefined)
