import { Button } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import React from "react"
import { JoinTeamInput, RevealWordInput } from "../api/server/domain/models"
import * as GameActions from "../api/server/game/main"
import { CodeNamesGame, Teams } from "../api/server/game/models"
import * as messages from "../api/server/messaging/messages"
import { addMessageHandler, emitMessage } from "../api/sockets/handler"
import { useSocket } from "../utils/hooks"
import { blueColor, redColor } from "../utils/ui"
import { OnWordClick, WordsBoardView } from "./WordsBoardView"

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  pad: {
    margin: 20,
  },
}))

export interface CodeNamesGameViewProps {
  gameId?: string | null
}

export const CodeNamesGameView: React.FC<CodeNamesGameViewProps> = ({ gameId: initialGameId }) => {
  const classes = useStyles()

  const [socket] = useSocket("http://192.168.1.67:3001", { autoConnect: false })
  const [error, setError] = React.useState("")
  const [userId] = React.useState("pedronsousa@gmail.com")
  const [gameId, setGameId] = React.useState(initialGameId || "")
  const [game, setGame] = React.useState<CodeNamesGame>(
    GameActions.createGame("", "", "", GameActions.buildBoard(5, 5, [])),
  )

  React.useEffect(() => {
    socket.connect()
    console.log("CONNECT", socket.id)

    addMessageHandler(socket, "connect", connectHandler)
    addMessageHandler(socket, "gameCreated", gameCreatedHandler)
    addMessageHandler(socket, "joinedGame", joinedGameHandler)
    addMessageHandler(socket, "joinTeam", joinTeamHandler)
    addMessageHandler(socket, "setSpyMaster", setSpyMasterHandler)
    addMessageHandler(socket, "startGame", startGameHandler)
    addMessageHandler(socket, "revealWord", revealWordHandler)
    addMessageHandler(socket, "changeTurn", endTurnHandler)
    addMessageHandler(socket, "gameError", errorHandler)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createGame = () => {
    emitMessage(socket, messages.createGame({ userId, language: "en" }))
  }

  const joinGame = () => {
    emitMessage(socket, messages.joinGame({ gameId, userId }))
  }

  const joinTeamBlue = () => {
    emitMessage(socket, messages.joinTeam({ gameId, userId, team: Teams.blue }))
  }

  const joinTeamRed = () => {
    emitMessage(socket, messages.joinTeam({ gameId, userId, team: Teams.red }))
  }

  const startGame = () => {
    emitMessage(socket, messages.startGame({ gameId, userId }))
  }

  const setSpyMaster = () => {
    emitMessage(socket, messages.setSpyMaster({ gameId, userId }))
  }

  const endTurn = () => {
    emitMessage(socket, messages.changeTurn({ gameId, userId }))
  }

  const connectHandler = () => {
    console.log("connected=====>")
    emitMessage(socket, messages.registerUserSocket({ userId }))
  }

  const gameCreatedHandler = (game: CodeNamesGame) => {
    console.log("gameCreatedHandler=====>", game)
    setGameId(game.gameId)
    setGame(game)
  }

  const joinedGameHandler = (game: CodeNamesGame) => {
    setGameId(game.gameId)
    setGame(game)
  }

  const joinTeamHandler = ({ team }: JoinTeamInput) => {
    setGame(GameActions.joinTeam(userId, team))
  }

  const startGameHandler = () => {
    setGame(GameActions.startGame)
  }

  const setSpyMasterHandler = () => {
    setGame(GameActions.setSpyMaster(userId))
  }

  const revealWordHandler = ({ row, col }: RevealWordInput) => {
    setGame(GameActions.revealWord(row, col))
  }

  const endTurnHandler = () => {
    setGame(GameActions.changeTurn)
  }

  const errorHandler = (e: { message: string }) => {
    console.log("ERROR=====>", e)
    setError(e.message)
  }

  const onWordClick: OnWordClick = (_, row, col) => {
    emitMessage(socket, messages.revealWord({ gameId, userId, row, col }))
  }

  const showGame = (game: CodeNamesGame) => (
    <table>
      <tbody>
        <tr>
          <td>Game Id</td>
          <td>{game.gameId}</td>
        </tr>
        <tr>
          <td>User Id</td>
          <td>{game.userId}</td>
        </tr>
        <tr>
          <td>Red SpyMaster</td>
          <td>{game.redSpyMaster}</td>
        </tr>
        <tr>
          <td>Blue SpyMaster</td>
          <td>{game.blueSpyMaster}</td>
        </tr>
      </tbody>
    </table>
  )

  const url = `http://192.168.1.67:4000/?gameId=${gameId}`

  return (
    <div className={classes.container}>
      <div className={classes.pad}>{error}</div>
      <input
        style={{ width: 300, textAlign: "center" }}
        className={classes.pad}
        value={gameId}
        onChange={event => setGameId(event.target.value)}
      />
      <div
        onClick={() => {
          navigator.clipboard.writeText(url)
        }}
      >
        {url}
      </div>
      <div>
        <Button variant="contained" color="primary" className={classes.pad} onClick={createGame}>
          CREATE
        </Button>
        <Button variant="contained" color="secondary" className={classes.pad} onClick={joinGame}>
          JOIN
        </Button>
      </div>
      {game && <Header game={game} />}
      {game && <WordsBoardView board={game.board} onWordClick={onWordClick} />}
      <Button variant="contained" className={classes.pad} onClick={joinTeamBlue}>
        JOIN TEAM BLUE
      </Button>
      <Button variant="contained" className={classes.pad} onClick={joinTeamRed}>
        JOIN TEAM RED
      </Button>
      <Button variant="contained" className={classes.pad} onClick={setSpyMaster}>
        SPY MASTER
      </Button>
      <Button variant="contained" className={classes.pad} onClick={startGame}>
        START
      </Button>
      <Button variant="contained" className={classes.pad} onClick={endTurn}>
        END TURN
      </Button>
      {game ? showGame(game) : null}
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
