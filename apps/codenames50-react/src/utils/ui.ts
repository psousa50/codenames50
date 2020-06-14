import { Teams } from "@psousa50/codenames50-core/lib/models"

export const teamName = (team?: Teams) => (team === Teams.red ? "Yellow" : team === Teams.blue ? "Blue" : undefined)
