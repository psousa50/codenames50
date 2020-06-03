import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Snackbar, Typography } from "@material-ui/core"
import { makeStyles, Theme } from "@material-ui/core/styles"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import VolumeOff from "@material-ui/icons/VolumeOff"
import VolumeUp from "@material-ui/icons/VolumeUp"
import { Alert, AlertTitle } from "@material-ui/lab"
import React from "react"
import { CodeNamesGame, GameStates } from "../codenames-core/models"
import * as Messages from "../messaging/messages"
import { useMessaging } from "../messaging/messaging"
import { EndedGameView } from "./EndedGameView"
import { RunningGameView } from "./RunningGameView"
import { SetupGameView } from "./SetupGameView"
import { UserView } from "./UserView"

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flow: 1,
    maxWidth: "990px",
    flexDirection: "column",
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
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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

export const CodeNamesGameView: React.FC<CodeNamesGameViewProps> = ({ gameId, userId }) => {
  const classes = useStyles()

  const [teamsExpanded, setTeamsExpanded] = React.useState(false)

  const onNextGame = () => {
    setTeamsExpanded(false)
  }

  const onStartGame = () => {
    setTeamsExpanded(true)
  }

  const {
    game,
    error,
    setError,
    soundOn,
    setSoundOn,
    emitMessage,
    joinTeam,
    startGame,
    nextGame,
    setSpyMaster,
  } = useMessaging(gameId, userId, onNextGame, onStartGame)

  const handleClose = () => {
    setError("")
  }

  const handleSound = () => {
    setSoundOn(s => !s)
  }

  const handleTeamsExpanded = (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setTeamsExpanded(isExpanded)
  }

  // const copyGameId = () => {
  //   const url = `${window.location.origin}/join?gameId=${gameId}`
  //   copy(url)
  // }

  return (
    <div className={classes.container}>
      <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={handleClose}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>

      <div className={classes.game}>
        <div className={classes.header}>
          <UserView
            userId={userId}
            team={getPlayer(game, userId)?.team}
            spyMaster={game.blueTeam.spyMaster === userId || game.redTeam.spyMaster === userId}
          />
          <div onClick={() => handleSound()}>{soundOn ? <VolumeUp /> : <VolumeOff />}</div>
        </div>

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
              <Typography className={classes.heading}>Teams</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <SetupGameView
                userId={userId}
                game={game}
                joinTeam={joinTeam}
                setSpyMaster={setSpyMaster}
                startGame={startGame}
                nextGame={nextGame}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>

        {game.state === GameStates.running && <RunningGameView game={game} userId={userId} emitMessage={emitMessage} />}

        {game.state === GameStates.ended && <EndedGameView userId={userId} game={game} nextGame={nextGame} />}
      </div>
    </div>
  )
}
