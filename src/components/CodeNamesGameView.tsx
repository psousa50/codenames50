import { Button, Snackbar } from "@material-ui/core"
import { makeStyles, Theme } from "@material-ui/core/styles"
import FileCopy from "@material-ui/icons/FileCopy"
import { Alert, AlertTitle } from "@material-ui/lab"
import copy from "copy-to-clipboard"
import React from "react"
import * as GameActions from "../codenames-core/main"
import { CodeNamesGame, GameStates, Teams } from "../codenames-core/models"
import * as Messages from "../messaging/messages"
import { useSocket } from "../utils/hooks"
import { EndedGameView } from "./EndedGameView"
import { RunningGameView } from "./RunningGameView"
import { SetupGameView } from "./SetupGameView"
import { UserView } from "./UserView"

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
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
  },
  copyId: {
    display: "flex",
    flexGrow: 1,
    alignSelf: "self-end",
  },
}))

export type EmitMessage = <T extends {}>(message: Messages.GameMessage<T>) => void

export interface CodeNamesGameViewProps {
  gameId: string
  userId: string
}

export const CodeNamesGameView: React.FC<CodeNamesGameViewProps> = ({ gameId, userId }) => {
  const classes = useStyles()

  const [socket] = useSocket(process.env.REACT_APP_SERVER_URL || "", { autoConnect: false })
  const [error, setError] = React.useState("")
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
    socket.on(type, handler)
  }

  React.useEffect(() => {
    socket.connect()
    console.log("CONNECT", socket.id)

    emitMessage(socket)(Messages.registerUserSocket({ userId }))

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

  const setSpyMaster = () => {
    emitMessage(socket)(Messages.setSpyMaster({ gameId, userId }))
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
  }

  const startGameHandler = () => {
    setGame(GameActions.startGame)
  }

  const setSpyMasterHandler = ({ userId }: Messages.SetSpyMasterInput) => {
    setGame(GameActions.setSpyMaster(userId))
  }

  const sendHintHandler = ({ hintWord, hintWordCount }: Messages.SendHintInput) => {
    setGame(GameActions.sendHint(hintWord, hintWordCount))
  }

  const revealWordHandler = ({ userId, row, col }: Messages.RevealWordInput) => {
    setGame(GameActions.revealWord(userId, row, col))
  }

  const endTurnHandler = () => {
    setGame(GameActions.changeTurn)
  }

  const errorHandler = (e: { message: string }) => {
    setError(e.message)
  }

  const handleClose = () => {
    setError("")
  }

  const copyGameId = () => {
    copy(gameId)
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
        <div className={classes.header}>
          <UserView userId={userId} team={getPlayer(game, userId)?.team} spyMaster />
          <div className={classes.copyId}>
            <Button onClick={() => copyGameId()}>
              <FileCopy />
            </Button>
          </div>
        </div>
        {game.state === GameStates.idle && (
          <SetupGameView game={game} joinTeam={joinTeam} setSpyMaster={setSpyMaster} startGame={startGame} />
        )}
        {game.state === GameStates.running && (
          <RunningGameView game={game} userId={userId} emitMessage={emitMessage(socket)} />
        )}
        {game.state === GameStates.ended && <EndedGameView game={game} nextGame={nextGame} />}
      </div>
    </div>
  )
}
