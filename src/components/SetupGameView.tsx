import { Button, makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, GameConfig, Teams } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { InvitePlayersDialog } from "./InvitePlayersDialog"
import { TeamsView } from "./TeamsView"

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  buttons: {
    width: "100%",
    display: "flex",
    flow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "5px",
  },
}))

interface SetupGameViewProps {
  userId: string
  game: CodeNamesGame
  joinTeam: (team: Teams) => void
  setSpyMaster: (team: Teams) => void
  randomizeTeams: () => void
  startGame: (config: GameConfig) => void
}

export const SetupGameView: React.FC<SetupGameViewProps> = ({
  userId,
  game,
  joinTeam,
  setSpyMaster,
  randomizeTeams,
  startGame,
}) => {
  const classes = useStyles()

  const [invitePlayersOpened, openInvitePlayers] = React.useState(false)

  const config = { language: "en", responseTimeoutSec: undefined }

  const canStartGame = GameRules.startGame(config)(game) === undefined
  const canRandomizeTeams = GameRules.ramdomizeTeams(game) === undefined

  return (
    <div className={classes.container}>
      <TeamsView userId={userId} game={game} joinTeam={joinTeam} setSpyMaster={setSpyMaster} />
      <div className={classes.buttons}>
        <div className={classes.button}>
          <Button
            disabled={!canRandomizeTeams}
            variant="contained"
            size="small"
            color="secondary"
            className={classes.button}
            onClick={() => randomizeTeams()}
          >
            Randomize Team
          </Button>
        </div>
        <div className={classes.button}>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            className={classes.button}
            onClick={() => openInvitePlayers(true)}
          >
            Invite Players
          </Button>
        </div>
      </div>
      <div className={classes.buttons}>
        <div className={classes.button}>
          <Button
            disabled={!canStartGame}
            variant="contained"
            size="small"
            color="primary"
            className={classes.button}
            onClick={() => startGame(config)}
          >
            Start Game
          </Button>
        </div>
      </div>
      <InvitePlayersDialog onClose={() => openInvitePlayers(false)} open={invitePlayersOpened} gameId={game.gameId} />
    </div>
  )
}
