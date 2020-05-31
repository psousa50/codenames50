import { Button } from "@material-ui/core"
import { common, grey } from "@material-ui/core/colors"
import { withStyles } from "@material-ui/styles"
import { Teams } from "../codenames-core/models"

export const redColor = "#f8931f"
export const blueColor = "#1b74ca"
export const inocentColor = "#bdbdbd"
export const backgroundColor = "#424242"

export const calculatedWidth = "calc(min(990px, 95vw))"

export const teamColor = (team?: Teams) => (team === Teams.red ? redColor : team === Teams.blue ? blueColor : undefined)

const teamStyle = (color: string) =>
  withStyles({
    root: {
      backgroundColor: color,
      color: common.white,
    },
    outlined: {
      color,
      backgroundColor: common.white,
    },
    icon: {
      color: grey[800],
    },
  })

export const redTeamStyles = teamStyle(redColor)
export const blueTeamStyles = teamStyle(blueColor)

const smallButtonStyle = withStyles({
  root: {
    minWidth: 0,
  },
})

export const SmallButton = smallButtonStyle(Button)
