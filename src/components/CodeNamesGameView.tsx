import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { task } from "fp-ts/lib/Task"
import * as GamesApi from "../api/games"
import { pipe } from "fp-ts/lib/pipeable"
import { CodeNamesGame } from "../api/models"
import { fold } from "fp-ts/lib/TaskEither"
import { WordsBoardView } from "./WordsBoardView"

const useStyles = makeStyles(theme => ({
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

  const [error, setError] = React.useState<string>("")
  const [gameId, setGameId] = React.useState<string>("")
  const [game, setGame] = React.useState<CodeNamesGame>()

  const createGame = async () => {
    await pipe(
      GamesApi.create({ userId: "pedronsousa@gmail.com", language: "en" }),
      fold(
        e => {
          setError(e.message)
          return task.of(undefined)
        },
        g => {
          setGameId(g.gameId)
          setGame(g)
          return task.of(undefined)
        },
      ),
    )()
  }

  const joinGame = async () => {
    await pipe(
      GamesApi.join({ gameId, userId: "pedronsousa@gmail.com" }),
      fold(
        e => {
          setError(e.message)
          return task.of(undefined)
        },
        g => {
          setGame(g)
          return task.of(undefined)
        },
      ),
    )()
  }

  return (
    <div className={classes.container}>
      <div>{error}</div>
      <button onClick={createGame}>CREATE</button>
      <input value={gameId} onChange={event => setGameId(event.target.value)} />
      <button onClick={joinGame}>JOIN</button>
      {game && <WordsBoardView board={game.board} />}
    </div>
  )
}
