import { Button } from "@material-ui/core"
import { common, grey } from "@material-ui/core/colors"
import { withStyles } from "@material-ui/styles"
import { GameModels } from "@codenames50/core"

export const redColor = "#f8931f"
export const blueColor = "#1b74ca"
export const inocentColor = "#bdbdbd"
export const backgroundColor = "#424242"

export const calculatedWidth = "calc(min(950px, 95vw))"
export const calculatedHeight = "calc(max(300px, min(min(650px, 65vw), 55vh)))"

export const teamColor = (team?: GameModels.Teams) =>
  team === GameModels.Teams.red ? redColor : team === GameModels.Teams.blue ? blueColor : undefined

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
