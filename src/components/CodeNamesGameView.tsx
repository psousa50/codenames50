import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { CodeNamesGame, RevealWordInput } from "../api/models"
import { WordsBoardView, OnWordClick } from "./WordsBoardView"
import { useSocket } from "../utils/hooks"
import { emitMessage, addMessageHandler } from "../api/sockets/handler"
import { revealWordMessage, createGameMessage, joinGameMessage } from "../api/sockets/messages"
import { update2dCell } from "../utils/collections"

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
  },
}))

export interface CodeNamesViewProps {
  gameId: string
}

export const CodeNamesView: React.FC = () => {
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const revealWordHandler = ({ row, col }: RevealWordInput) => {
    setGame(g => ({
      ...g!,
      board: update2dCell(g!.board)(
        w => ({
          ...w,
          revealed: true,
        }),
        row,
        col,
      ),
    }))
  }

  // const createGame = async () => {
  //   await pipe(
  //     GamesApi.create({ userId, language: "en" }),
  //     fold(
  //       e => {
  //         setError(e.message)
  //         return task.of(undefined)
  //       },
  //       g => {
  //         setGameId(g.gameId)
  //         setGame(g)
  //         return task.of(undefined)
  //       },
  //     ),
  //   )()
  // }

  const createGame = () => {
    emitMessage(socket, createGameMessage({ userId, language: "en" }))
  }

  const joinGame = () => {
    emitMessage(socket, joinGameMessage({ gameId, userId }))
  }

  const gameCreatedHandler = (game: CodeNamesGame) => {
    console.log("gameCreatedHandler=====>", game)
    setGameId(game.gameId)
    setGame(game)
  }

  const joinedGameHandler = (game: CodeNamesGame) => {
    console.log("joinedGameHandler=====>", game)
    setGameId(game.gameId)
    setGame(game)
  }

  // const joinGame = async () => {
  //   await pipe(
  //     GamesApi.join({ gameId, userId: "pedronsousa@gmail.com" }),
  //     fold(
  //       e => {
  //         setError(e.message)
  //         return task.of(undefined)
  //       },
  //       g => {
  //         setGame(g)
  //         return task.of(undefined)
  //       },
  //     ),
  //   )()
  // }

  const onWordClick: OnWordClick = (_, row, col) => {
    emitMessage(socket, revealWordMessage({ gameId, userId, row, col }))
  }

  return (
    <div className={classes.container}>
      <div>{error}</div>
      <button onClick={createGame}>CREATE</button>
      <input value={gameId} onChange={event => setGameId(event.target.value)} />
      <button onClick={joinGame}>JOIN</button>
      {game && <WordsBoardView board={game.board} onWordClick={onWordClick} />}
    </div>
  )
}
