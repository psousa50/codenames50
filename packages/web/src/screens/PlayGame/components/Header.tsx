import { GameHelpers, GameModels } from "@codenames50/core"
import { makeStyles, Theme, IconButton, Tooltip } from "@material-ui/core"
import VolumeOff from "@material-ui/icons/VolumeOff"
import VolumeUp from "@material-ui/icons/VolumeUp"
import SettingsIcon from "@material-ui/icons/Settings"
import React from "react"
import { EnvironmentContext } from "../../../environment"
import { User } from "./User"

interface HeaderProps {
  game: GameModels.CodeNamesGame
  userId: string
  onSetupClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ game, userId, onSetupClick }) => {
  const classes = useStyles()

  const environment = React.useContext(EnvironmentContext)

  const handleSound = () => {
    environment.toggleSound()
  }

  return (
    <div className={classes.header}>
      <User
        userId={userId}
        team={GameHelpers.getPlayer(game, userId)?.team}
        spyMaster={game.blueTeam.spyMaster === userId || game.redTeam.spyMaster === userId}
      />
      <div className={classes.controls}>
        {onSetupClick && (
          <Tooltip title="Game Setup">
            <IconButton onClick={onSetupClick} className={classes.setupButton}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )}
        <IconButton onClick={handleSound} className={classes.soundButton}>
          {environment.config.soundOn ? <VolumeUp /> : <VolumeOff />}
        </IconButton>
      </div>
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  game: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px",
  },
  header: {
    display: "flex",
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  controls: {
    position: "absolute",
    right: "10px",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  setupButton: {
    color: theme.palette.primary.main,
  },
  soundButton: {
    cursor: "pointer",
  },
  content: {
    justifyContent: "center",
  },
  teams: {
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
  heading: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: 500,
    color: theme.palette.secondary.main,
  },
  copyId: {
    fontSize: 10,
    cursor: "pointer",
    paddingBottom: "10px",
  },
}))
