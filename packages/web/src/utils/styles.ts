import { Button } from "@mui/material"
import { common, grey } from "@mui/material/colors"
import { styled } from "@mui/material/styles"
import { GameModels } from "@codenames50/core"

export const redColor = "#f8931f"
export const blueColor = "#1b74ca"
export const inocentColor = "#bdbdbd"
export const backgroundColor = "#424242"

export const calculatedWidth = "calc(min(950px, 95vw))"
export const calculatedHeight = "calc(max(300px, min(min(650px, 65vw), 55vh)))"

export const teamColor = (team?: GameModels.Teams) =>
  team === GameModels.Teams.red ? redColor : team === GameModels.Teams.blue ? blueColor : undefined

const createTeamButton = (color: string) =>
  styled(Button)(({ theme, variant }) => ({
    backgroundColor: variant === "outlined" ? common.white : color,
    color: variant === "outlined" ? color : common.white,
    "&:hover": {
      backgroundColor: variant === "outlined" ? grey[100] : theme.palette.grey[700],
    },
    "& .MuiSvgIcon-root": {
      color: grey[800],
    },
  }))

export const RedTeamButton = createTeamButton(redColor)
export const BlueTeamButton = createTeamButton(blueColor)

export const SmallButton = styled(Button)({
  minWidth: 0,
})
