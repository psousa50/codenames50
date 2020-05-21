import { Button } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import React from "react"
import * as uuid from "uuid"
import * as GameActions from "../codenames-core/main"
import { CodeNamesGame, GameStates, Teams } from "../codenames-core/models"
import * as Messages from "../messaging/messages"
import { useSocket } from "../utils/hooks"
import { HintView } from "./HintView"
import { TeamsView } from "./TeamsView"
import { OnWordClick, WordsBoardView } from "./WordsBoardView"

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
}))

const addSampleGame = (game: CodeNamesGame) => {
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
  gameId?: string | null
  userId?: string | null
}

export const CodeNamesGameView: React.FC<CodeNamesGameViewProps> = ({
  gameId: initialGameId,
  userId: initialUserId,
}) => {
  const classes = useStyles()

  const [socket] = useSocket("http://192.168.1.67:3001", { autoConnect: false })
  const [error, setError] = React.useState("")
  const [hintWord, setHintWord] = React.useState("")
  const [hintWordCount, setHintWordCount] = React.useState<number | undefined>()
  const [userId, setUserId] = React.useState(initialUserId || `player ${Math.floor(Math.random() * 10) + 10}`)
  const [gameId, setGameId] = React.useState(initialGameId || uuid.v4)
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
    addMessageHandler(socket, "gameCreated", gameCreatedHandler)
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

  const createGame = () => {
    emitMessage(socket, Messages.createGame({ gameId, userId, language: "en" }))
  }

  const joinGame = () => {
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

  const connectHandler = () => {
    emitMessage(socket, Messages.registerUserSocket({ userId }))
  }

  const gameCreatedHandler = (game: CodeNamesGame) => {
    setGameId(game.gameId)
    setGame(addSampleGame(game))
  }

  const joinedGameHandler = (game: CodeNamesGame) => {
    setGameId(game.gameId)
    setGame(game)
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

  const url = `http://192.168.1.67:4000/?gameId=${gameId}`

  return (
    <div className={classes.container}>
      <div className={classes.game}>
        <div>{error}</div>
        <input
          style={{ width: 300, textAlign: "center" }}
          value={gameId}
          onChange={event => setGameId(event.target.value)}
        />
        <input
          style={{ width: 300, textAlign: "center" }}
          value={userId}
          onChange={event => setUserId(event.target.value)}
        />
        <div
          onClick={() => {
            navigator.clipboard.writeText(url)
          }}
        >
          {url}
        </div>
        <div>
          <Button variant="contained" color="primary" onClick={createGame}>
            CREATE
          </Button>
          <Button variant="contained" color="secondary" onClick={joinGame}>
            JOIN
          </Button>
        </div>
        <TeamsView game={game} joinTeam={joinTeam} />
        <Button variant="contained" color="secondary" onClick={setSpyMaster}>
          I'm the Spy Master
        </Button>
        <Button variant="contained" color="primary" onClick={startGame}>
          START
        </Button>
        <Button variant="contained" onClick={endTurn}>
          END TURN
        </Button>
        <WordsBoardView
          board={game.board}
          onWordClick={onWordClick}
          revealWords={
            game.state === GameStates.running &&
            (userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster)
          }
        />
        {userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster ? (
          <HintView hintWord={hintWord} hintWordCount={hintWordCount} onChange={setHint} sendHint={sendHint} />
        ) : (
          <HintView hintWord={game.hintWord} hintWordCount={game.hintWordCount} />
        )}
      </div>
    </div>
  )
}
