import { IconButton, Tooltip, Box } from "@mui/material"
import VolumeOff from "@mui/icons-material/VolumeOff"
import VolumeUp from "@mui/icons-material/VolumeUp"
import SettingsIcon from "@mui/icons-material/Settings"
import React from "react"
import { GameModels, GameHelpers } from "@codenames50/core"
import { EnvironmentContext } from "../../../environment"
import { calculatedWidth } from "../../../utils/styles"
import { User } from "./User"

export interface HeaderProps {
  game: GameModels.CodeNamesGame
  userId: string
  onSetupClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ game, userId, onSetupClick }) => {
  const environment = React.useContext(EnvironmentContext)

  const handleSound = () => {
    environment.toggleSound()
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: calculatedWidth,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "10px",
        paddingBottom: "10px",
        margin: "0 auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <User
          userId={userId}
          team={GameHelpers.getPlayer(game, userId)?.team}
          spyMaster={game.blueTeam.spyMaster === userId || game.redTeam.spyMaster === userId}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: "5px",
        }}
      >
        {onSetupClick && (
          <Tooltip title="Game Setup">
            <IconButton onClick={onSetupClick} sx={{ color: "primary.main", padding: "8px" }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )}
        <IconButton onClick={handleSound} sx={{ cursor: "pointer", padding: "8px" }}>
          {environment.config.soundOn ? <VolumeUp /> : <VolumeOff />}
        </IconButton>
      </Box>
    </Box>
  )
}
