import { common, grey } from "@material-ui/core/colors"
import { withStyles } from "@material-ui/styles"
import { Teams } from "../codenames-core/models"

export const redColor = "#d32f2f"
export const blueColor = "#1976d2"

export const teamColor = (team?: Teams) => (team === Teams.red ? redColor : team === Teams.blue ? blueColor : undefined)

const teamStyle = (color: string) =>
  withStyles({
    root: {
      color: common.white,
      backgroundColor: color,
    },
    outlined: {
      color,
      backgroundColor: common.white,
    },
    icon: {
      color: grey[200],
    },
  })

export const redTeamStyles = teamStyle(redColor)
export const blueTeamStyles = teamStyle(blueColor)
