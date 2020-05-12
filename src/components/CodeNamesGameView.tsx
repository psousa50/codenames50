import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { CodeNamesGame, RevealWordInput, Teams } from "../api/models"
import { WordsBoardView, OnWordClick } from "./WordsBoardView"
import { useSocket } from "../utils/hooks"
import { emitMessage, addMessageHandler } from "../api/sockets/handler"
import { revealWordMessage, createGameMessage, joinGameMessage, changeTurnMessage } from "../api/sockets/messages"
import { update2dCell } from "../utils/collections"
import { redColor, blueColor } from "../utils/ui"

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
  },
}))

export interface CodeNamesGameViewProps {
  gameId: string
}

export const CodeNamesGameView: React.FC = () => {
  const classes = useStyles()

  const [socket] = useSocket("http://127.0.0.1:3000", { autoConnect: false })
  const [error] = React.useState("")
  const [userId] = React.useState("pedronsousa@gmail.com")
  const [gameId, setGameId] = React.useState("")
  const [game, setGame] = React.useState<CodeNamesGame>()

  React.useEffect(() => {
    socket.connect()
    console.log("CONNECT")

    addMessageHandler(socket, "gameCreated", gameCreatedHandler)
    addMessageHandler(socket, "joinedGame", joinedGameHandler)
    addMessageHandler(socket, "revealWord", revealWordHandler)
    addMessageHandler(socket, "changeTurn", endTurnHandler)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const revealWordHandler = ({ row, col }: RevealWordInput) => {
    setGame(g =>
      g
        ? {
            ...g,
            board: update2dCell(g.board)(
              w => ({
                ...w,
                revealed: true,
              }),
              row,
              col,
            ),
          }
        : g,
    )
  }

  const createGame = () => {
    emitMessage(socket, createGameMessage({ userId, language: "en" }))
  }

  const joinGame = () => {
    emitMessage(socket, joinGameMessage({ gameId, userId }))
  }

  const endTurn = () => {
    emitMessage(socket, changeTurnMessage({ gameId, userId }))
  }

  const gameCreatedHandler = (game: CodeNamesGame) => {
    setGameId(game.gameId)
    setGame(game)
  }

  const joinedGameHandler = (game: CodeNamesGame) => {
    setGameId(game.gameId)
    setGame(game)
  }

  const endTurnHandler = () => {
    setGame(g =>
      g
        ? {
            ...g,
            turn: g.turn === Teams.red ? Teams.blue : Teams.red,
          }
        : g,
    )
  }

  const onWordClick: OnWordClick = (_, row, col) => {
    emitMessage(socket, revealWordMessage({ gameId, userId, row, col }))
  }

  return (
    <div className={classes.container}>
      <div>{error}</div>
      <button onClick={createGame}>CREATE</button>
      <input value={gameId} onChange={event => setGameId(event.target.value)} />
      <button onClick={joinGame}>JOIN</button>
      <button onClick={endTurn}>END TURN</button>
      {game && <Header game={game} />}
      {game && <WordsBoardView board={game.board} onWordClick={onWordClick} />}
    </div>
  )
}

interface HeaderProps {
  game: CodeNamesGame
}

const Header: React.FC<HeaderProps> = ({ game }) => {
  const styles = {
    turn: {
      backgroundColor: game.turn === Teams.red ? redColor : blueColor,
    },
  }

  return <div style={styles.turn}>TURN</div>
}
