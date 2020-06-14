import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Snackbar, Typography } from "@material-ui/core"
import { makeStyles, Theme } from "@material-ui/core/styles"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { Alert, AlertTitle } from "@material-ui/lab"
import { GameStates } from "codenames50-core/lib/models"
import React from "react"
import * as Messages from "../messaging/messages"
import { useMessaging } from "../utils/messaging"
import { EndedGameView } from "./EndedGameView"
import { HeaderView } from "./HeaderView"
import { RunningGameView } from "./RunningGameView"
import { SetupGameView } from "./SetupGameView"

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

export type EmitMessage = <T extends {}>(message: Messages.GameMessage<T>) => void

export interface CodeNamesGameViewProps {
  gameId: string
  userId: string
}

const Separator = () => <div style={{ height: "20px" }}></div>

export const CodeNamesGameView: React.FC<CodeNamesGameViewProps> = ({ gameId, userId }) => {
  const classes = useStyles()

  const [teamsExpanded, setTeamsExpanded] = React.useState(false)

  const onRestartGame = () => {}

  const onStartGame = () => {}

  const {
    emitMessage,
    error,
    game,
    joinTeam,
    randomizeTeams,
    setError,
    setSpyMaster,
    startGame,
    restartGame,
  } = useMessaging(gameId, userId, onStartGame, onRestartGame)

  React.useEffect(() => {
    setTeamsExpanded(game.state === GameStates.idle)
  }, [game.state])

  const handleClose = () => {
    setError("")
  }

  const handleTeamsExpanded = (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setTeamsExpanded(isExpanded)
  }

  return (
    <div className={classes.container}>
      <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={handleClose}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>

      <div className={classes.game}>
        <HeaderView game={game} userId={userId} />

        <Separator />

        <div className={classes.teams}>
          <ExpansionPanel expanded={teamsExpanded} onChange={handleTeamsExpanded}>
            <ExpansionPanelSummary
              classes={{
                content: classes.content,
              }}
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Game Setup</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <SetupGameView
                userId={userId}
                game={game}
                joinTeam={joinTeam}
                setSpyMaster={setSpyMaster}
                randomizeTeams={randomizeTeams}
                startGame={startGame}
                newGame={restartGame}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>

        <Separator />

        {game.state === GameStates.running && <RunningGameView game={game} userId={userId} emitMessage={emitMessage} />}

        {game.state === GameStates.ended && <EndedGameView userId={userId} game={game} newGame={restartGame} />}
      </div>
    </div>
  )
}
