import { Button } from "@material-ui/core"
import { common, grey } from "@material-ui/core/colors"
import { withStyles } from "@material-ui/styles"
import { Teams } from "../codenames-core/models"

export const redColor = "#38006b"
export const redColorLight = "#9c4dcc"
export const blueColor = "#c56000"
export const blueColorLight = "#ffc046"
export const inocentColor = "#fff9c4"
export const inocentColorLight = "#fffff7"

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
