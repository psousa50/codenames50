import { GameHelpers, GameModels } from "@codenames50/core"
import { makeStyles, Theme } from "@material-ui/core"
import VolumeOff from "@material-ui/icons/VolumeOff"
import VolumeUp from "@material-ui/icons/VolumeUp"
import React from "react"
import { EnvironmentContext } from "../../../environment"
import { User } from "./User"

interface HeaderProps {
  game: GameModels.CodeNamesGame
  userId: string
}

export const Header: React.FC<HeaderProps> = ({ game, userId }) => {
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
      <div className={classes.sound} onClick={() => handleSound()}>
        {environment.config.soundOn ? <VolumeUp /> : <VolumeOff />}
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
  },
  sound: {
    position: "absolute",
    right: "10px",
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
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.secondary.main,
  },
  copyId: {
    fontSize: 10,
    cursor: "pointer",
    paddingBottom: "10px",
  },
}))
