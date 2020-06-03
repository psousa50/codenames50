import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Snackbar, Typography } from "@material-ui/core"
import { makeStyles, Theme } from "@material-ui/core/styles"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import VolumeOff from "@material-ui/icons/VolumeOff"
import VolumeUp from "@material-ui/icons/VolumeUp"
import { Alert, AlertTitle } from "@material-ui/lab"
import React from "react"
import * as GameActions from "../codenames-core/main"
import { CodeNamesGame, GameStates, Teams } from "../codenames-core/models"
import * as Messages from "../messaging/messages"
import { useSocket } from "../utils/hooks"
import { sounds, usePlaySound } from "../utils/usePlaySounds"
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
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
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

  const [playSuccessSound] = usePlaySound(sounds.success)
  const [playFailureSound] = usePlaySound(sounds.failure)
  const [playHintAlertSound] = usePlaySound(sounds.hintAlert)
  const [playAssassinSound] = usePlaySound(sounds.assassin)
  const [playEndGame] = usePlaySound(sounds.endGame)

  const [soundOn, setSoundOn] = React.useState(true)

  const [socket] = useSocket(process.env.REACT_APP_SERVER_URL || "", { autoConnect: false })
  const [error, setError] = React.useState("")
  const [teamsExpanded, setTeamsExpanded] = React.useState(false)
  const [game, setGame] = React.useState<CodeNamesGame>(
    GameActions.createGame("", "", "", "", GameActions.buildBoard(5, 5, [])),
  )

  const emitMessage = (socket: SocketIOClient.Socket): EmitMessage => message => {
    setError("")
    console.log("EMIT=====>\n", message)
    socket.emit(message.type, message.data)
  }

  const addMessageHandler = <T extends {}>(
    socket: SocketIOClient.Socket,
    type: Messages.GameMessageType,
    handler: (data: T) => void,
  ) => {
    socket.on(type, (data: T) => {
      console.log("RECEIVED=====>", type, data)
      return handler(data)
    })
  }

  React.useEffect(() => {
    socket.connect()
    console.log("CONNECT", socket.id)

    addMessageHandler(socket, "connect", connectHandler)

    addMessageHandler(socket, "removePlayer", removePlayerHandler)
    addMessageHandler(socket, "joinedGame", joinedGameHandler)
    addMessageHandler(socket, "joinTeam", joinTeamHandler)
    addMessageHandler(socket, "nextGame", nextGameHandler)
    addMessageHandler(socket, "setSpyMaster", setSpyMasterHandler)
    addMessageHandler(socket, "startGame", startGameHandler)
    addMessageHandler(socket, "sendHint", sendHintHandler)
    addMessageHandler(socket, "revealWord", revealWordHandler)
    addMessageHandler(socket, "changeTurn", endTurnHandler)
    addMessageHandler(socket, "gameError", errorHandler)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connectHandler = () => {
    emitMessage(socket)(Messages.registerUserSocket({ userId }))

    joinGame()
  }

  const joinGame = () => {
    emitMessage(socket)(Messages.joinGame({ gameId, userId }))
  }

  const joinTeam = (team: Teams) => {
    emitMessage(socket)(Messages.joinTeam({ gameId, userId, team }))
  }

  const startGame = () => {
    emitMessage(socket)(Messages.startGame({ gameId, userId }))
  }

  const nextGame = () => {
    emitMessage(socket)(Messages.nextGame({ gameId }))
  }

  const setSpyMaster = (team: Teams) => {
    emitMessage(socket)(Messages.setSpyMaster({ gameId, userId, team }))
  }

  const joinedGameHandler = (game: CodeNamesGame) => {
    setGame(game)
  }

  const removePlayerHandler = ({ userId }: Messages.RemovePlayerInput) => {
    setGame(GameActions.removePlayer(userId))
  }

  const joinTeamHandler = ({ userId, team }: Messages.JoinTeamInput) => {
    setGame(GameActions.joinTeam(userId, team))
  }

  const nextGameHandler = (game: CodeNamesGame) => {
    setGame(game)
    setTeamsExpanded(true)
  }

  const startGameHandler = () => {
    setGame(GameActions.startGame)
    setTeamsExpanded(false)
  }

  const setSpyMasterHandler = ({ userId, team }: Messages.SetSpyMasterInput) => {
    setGame(GameActions.setSpyMaster(userId, team))
  }

  const sendHintHandler = ({ hintWord, hintWordCount }: Messages.SendHintInput) => {
    setGame(GameActions.sendHint(hintWord, hintWordCount))
    const teamConfig = game.turn === Teams.red ? game.redTeam : game.blueTeam
    if (teamConfig.spyMaster !== userId) {
      playHintAlertSound(soundOn)
    }
  }

  const revealWordHandler = ({ userId, row, col }: Messages.RevealWordInput) => {
    setGame(oldGame => {
      const newGame = GameActions.revealWord(userId, row, col)(oldGame)
      if (newGame.turnOutcome === "success") {
        playSuccessSound(soundOn)
      }
      if (newGame.turnOutcome === "failure") {
        playFailureSound(soundOn)
      }
      if (newGame.turnOutcome === "assassin") {
        playAssassinSound(soundOn)
      } else if (newGame.state === GameStates.ended) {
        playEndGame(soundOn)
      }

      return newGame
    })
  }

  const endTurnHandler = () => {
    setGame(GameActions.changeTurn)
  }

  const errorHandler = (e: { message: string }) => {
    setError(e.message)
    console.log("ERROR=====>")
  }

  const handleClose = () => {
    setError("")
  }

  const handleSound = () => {
    setSoundOn(s => !s)
  }

  const handleTeamsExpanded = (event: React.ChangeEvent<{}>, isExpanded: boolean) => setTeamsExpanded(isExpanded)

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

        {game.state === GameStates.running && (
          <RunningGameView game={game} userId={userId} emitMessage={emitMessage(socket)} />
        )}

        {game.state === GameStates.ended && <EndedGameView userId={userId} game={game} nextGame={nextGame} />}
      </div>
    </div>
  )
}
