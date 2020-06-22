import { Teams } from "codenames50-core/lib/models"

export const teamName = (team?: Teams) => (team === Teams.red ? "Yellow" : team === Teams.blue ? "Blue" : undefined)
