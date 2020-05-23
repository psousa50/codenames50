import { Snackbar } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { Alert, AlertTitle } from "@material-ui/lab"
import React from "react"
import * as GameActions from "../codenames-core/main"
import { CodeNamesGame, GameStates, Teams } from "../codenames-core/models"
import * as Messages from "../messaging/messages"
import { useSocket } from "../utils/hooks"
import { HintView } from "./HintView"
import { SetupGameView } from "./SetupGameView"
import { UserView } from "./UserView"
import { OnWordClick, WordsBoardView } from "./WordsBoardView"

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  game: {
    display: "flex",
    flex: 8,
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  user: {
    border: "1px solid black",
    fontSize: "20px",
  },
}))

export const addSampleGame = (game: CodeNamesGame) => {
  const players = [
    { userId: "Pedro", team: Teams.blue },
    { userId: "Carla", team: Teams.blue },
    { userId: "Beatriz", team: Teams.blue },
    { userId: "Vasco", team: Teams.red },
    { userId: "Guiga", team: Teams.red },
    { userId: "Filipe", team: Teams.red },
    { userId: "Rozito", team: Teams.red },
  ]
  return GameActions.startGame({
    ...game,
    players,
    blueTeam: {
      spyMaster: "Pedro",
      wordsLeft: undefined,
    },
    redTeam: {
      spyMaster: "Vasco",
      wordsLeft: undefined,
    },
  })
}

export interface CodeNamesGameViewProps {
  gameId: string
  userId: string
}

export const CodeNamesGameView: React.FC<CodeNamesGameViewProps> = ({ gameId, userId }) => {
  const classes = useStyles()

  const [socket] = useSocket("http://192.168.1.67:3001", { autoConnect: false })
  const [error, setError] = React.useState("")
  const [hintWord, setHintWord] = React.useState("")
  const [hintWordCount, setHintWordCount] = React.useState<number | undefined>()
  const [game, setGame] = React.useState<CodeNamesGame>(
    GameActions.createGame("", "", "", GameActions.buildBoard(5, 5, [])),
  )

  const emitMessage = <T extends {}>(socket: SocketIOClient.Socket, message: Messages.GameMessage<T>) => {
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

    addMessageHandler(socket, "connect", connectHandler)

    addMessageHandler(socket, "joinedGame", joinedGameHandler)
    addMessageHandler(socket, "joinTeam", joinTeamHandler)
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
    console.log("joinGame=====>", gameId, userId)
    emitMessage(socket, Messages.joinGame({ gameId, userId }))
  }

  const joinTeam = (team: Teams) => {
    emitMessage(socket, Messages.joinTeam({ gameId, userId, team }))
  }

  const startGame = () => {
    emitMessage(socket, Messages.startGame({ gameId, userId }))
  }

  const setSpyMaster = () => {
    emitMessage(socket, Messages.setSpyMaster({ gameId, userId }))
  }

  const sendHint = () => {
    hintWordCount && emitMessage(socket, Messages.sendHint({ gameId, userId, hintWord, hintWordCount }))
  }

  const revealWord = (row: number, col: number) => {
    emitMessage(socket, Messages.revealWord({ gameId, userId, row, col }))
  }

  const endTurn = () => {
    emitMessage(socket, Messages.changeTurn({ gameId, userId }))
  }

  const joinedGameHandler = (game: CodeNamesGame) => {
    setGame(addSampleGame(game))
  }

  const joinTeamHandler = ({ userId, team }: Messages.JoinTeamInput) => {
    setGame(GameActions.joinTeam(userId, team))
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

  const revealWordHandler = ({ row, col }: Messages.RevealWordInput) => {
    setGame(GameActions.revealWord(userId, row, col))
  }

  const endTurnHandler = () => {
    setGame(GameActions.changeTurn)
  }

  const errorHandler = (e: { message: string }) => {
    setError(e.message)
  }

  const onWordClick: OnWordClick = (_, row, col) => {
    revealWord(row, col)
  }

  const setHint = (hintWord: string, hintWordCount?: number) => {
    setHintWord(hintWord)
    setHintWordCount(hintWordCount)
  }

  const handleClose = () => {
    setError("")
  }

  return (
    <div className={classes.game}>
      <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={handleClose}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>

      <UserView userId={userId} team={getPlayer(game, userId)?.team} spyMaster />
      <SetupGameView game={game} joinTeam={joinTeam} setSpyMaster={setSpyMaster} startGame={startGame} />
      <WordsBoardView
        board={game.board}
        onWordClick={onWordClick}
        revealWords={
          game.state === GameStates.running && (userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster)
        }
      />
      {userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster ? (
        <HintView hintWord={hintWord} hintWordCount={hintWordCount} onChange={setHint} sendHint={sendHint} />
      ) : (
        <HintView hintWord={game.hintWord} hintWordCount={game.hintWordCount} />
      )}
    </div>
  )
}
