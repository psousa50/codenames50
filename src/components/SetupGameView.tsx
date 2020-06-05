import { Button, makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, GameStates, Teams } from "../codenames-core/models"
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
    display: "flex",
    flow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing(3),
  },
  button: {
    margin: "20px",
  },
}))

interface SetupGameViewProps {
  userId: string
  game: CodeNamesGame
  joinTeam: (team: Teams) => void
  setSpyMaster: (team: Teams) => void
  startGame: () => void
  nextGame: () => void
}

export const SetupGameView: React.FC<SetupGameViewProps> = ({
  userId,
  game,
  joinTeam,
  setSpyMaster,
  startGame,
  nextGame,
}) => {
  const classes = useStyles()

  const [invitePlayersOpened, openInvitePlayers] = React.useState(false)

  const canStartGame = GameRules.startGame(game) === undefined

  return (
    <div className={classes.container}>
      <TeamsView userId={userId} game={game} joinTeam={joinTeam} setSpyMaster={setSpyMaster} />
      <div className={classes.buttons}>
        <Button
          disabled={!canStartGame}
          variant="contained"
          size="small"
          color="primary"
          className={classes.button}
          onClick={() => startGame()}
        >
          Start Game
        </Button>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          className={classes.button}
          onClick={() => openInvitePlayers(true)}
        >
          Invite Players
        </Button>
        <Button
          disabled={game.state === GameStates.idle}
          variant="contained"
          size="small"
          color="primary"
          className={classes.button}
          onClick={() => nextGame()}
        >
          New Game
        </Button>
      </div>
      <InvitePlayersDialog onClose={() => openInvitePlayers(false)} open={invitePlayersOpened} gameId={game.gameId} />
    </div>
  )
}
