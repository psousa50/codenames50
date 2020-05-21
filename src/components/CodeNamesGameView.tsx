import { Button } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import React from "react"
import * as uuid from "uuid"
import { JoinTeamInput, RevealWordInput, SendHintInput, SetSpyMasterInput } from "../api/server/domain/models"
import * as GameActions from "../api/server/game/main"
import { CodeNamesGame, GameStates, Teams } from "../api/server/game/models"
import * as messages from "../api/server/messaging/messages"
import { GameMessageType } from "../api/server/messaging/messages"
import { useSocket } from "../utils/hooks"
import { blueColor, redColor } from "../utils/ui"
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
  messages: {
    display: "flex",
    flex: 1,
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
  userId?: string | null
}

export const CodeNamesGameView: React.FC<CodeNamesGameViewProps> = ({
  gameId: initialGameId,
  userId: initialUserId,
}) => {
  const classes = useStyles()

  const [socket] = useSocket("http://192.168.1.67:3001", { autoConnect: false })
  const [socketMessages, setSocketMessages] = React.useState<string[]>([])
  const [error, setError] = React.useState("")
  const [hintWord, setHintWord] = React.useState("")
  const [hintWordCount, setHintWordCount] = React.useState("")
  const [userId, setUserId] = React.useState(initialUserId || `player ${Math.floor(Math.random() * 10) + 10}`)
  const [gameId, setGameId] = React.useState(initialGameId || uuid.v4)
  const [game, setGame] = React.useState<CodeNamesGame>(
    GameActions.createGame("", "", "", GameActions.buildBoard(5, 5, [])),
  )

  const emitMessage = <T extends {}>(socket: SocketIOClient.Socket, message: messages.GameMessage<T>) => {
    setError("")
    console.log("EMIT=====>\n", message)
    socket.emit(message.type, message.data)
  }

  const addMessageHandler = <T extends {}>(
    socket: SocketIOClient.Socket,
    type: GameMessageType,
    handler: (data: T) => void,
  ) => {
    socket.on(type, (data: T) => {
      setSocketMessages(sm => [...sm, type].slice(0, 10))
      handler(data)
    })
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
    emitMessage(socket, messages.createGame({ gameId, userId, language: "en" }))
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

  const sendHint = () => {
    emitMessage(socket, messages.sendHint({ gameId, userId, hintWord, hintWordCount: Number.parseInt(hintWordCount) }))
  }

  const revealWord = (row: number, col: number) => {
    emitMessage(socket, messages.revealWord({ gameId, userId, row, col }))
  }

  const endTurn = () => {
    emitMessage(socket, messages.changeTurn({ gameId, userId }))
  }

  const connectHandler = () => {
    emitMessage(socket, messages.registerUserSocket({ userId }))
  }

  const gameCreatedHandler = (game: CodeNamesGame) => {
    setGameId(game.gameId)
    setGame(game)
  }

  const joinedGameHandler = (game: CodeNamesGame) => {
    setGameId(game.gameId)
    setGame(game)
  }

  const joinTeamHandler = ({ userId, team }: JoinTeamInput) => {
    setGame(GameActions.joinTeam(userId, team))
  }

  const startGameHandler = () => {
    setGame(GameActions.startGame)
  }

  const setSpyMasterHandler = ({ userId }: SetSpyMasterInput) => {
    setGame(GameActions.setSpyMaster(userId))
  }

  const sendHintHandler = ({ hintWord, hintWordCount }: SendHintInput) => {
    setGame(GameActions.sendHint(hintWord, hintWordCount))
  }

  const revealWordHandler = ({ row, col }: RevealWordInput) => {
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
          <td>State</td>
          <td>{game.state}</td>
        </tr>
        <tr>
          <td>Turn</td>
          <td>{game.turn}</td>
        </tr>
        <tr>
          <td>Players</td>
          <td>{JSON.stringify(game.players, null, 2)}</td>
        </tr>
        <tr>
          <td>Red SpyMaster</td>
          <td>{game.redTeam.spyMaster}</td>
        </tr>
        <tr>
          <td>Blue SpyMaster</td>
          <td>{game.blueTeam.spyMaster}</td>
        </tr>
        <tr>
          <td>Hint word</td>
          <td>{game.hintWord}</td>
        </tr>
        <tr>
          <td>Hint word count</td>
          <td>{game.hintWordCount}</td>
        </tr>
        <tr>
          <td>Words Revealed</td>
          <td>{game.wordsRevealedCount}</td>
        </tr>
      </tbody>
    </table>
  )

  const url = `http://192.168.1.67:4000/?gameId=${gameId}`

  return (
    <div className={classes.container}>
      <div className={classes.game}>
        <div className={classes.pad}>{error}</div>
        <input
          style={{ width: 300, textAlign: "center" }}
          className={classes.pad}
          value={gameId}
          onChange={event => setGameId(event.target.value)}
        />
        <input
          style={{ width: 300, textAlign: "center" }}
          className={classes.pad}
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
          <Button variant="contained" color="primary" className={classes.pad} onClick={createGame}>
            CREATE
          </Button>
          <Button variant="contained" color="secondary" className={classes.pad} onClick={joinGame}>
            JOIN
          </Button>
        </div>
        {game && <Header game={game} />}
        {game && <div>{`Hint Word: ${game.hintWord}`}</div>}
        {game && <div>{`Hint Word Count: ${game.hintWordCount}`}</div>}
        {game && (
          <WordsBoardView
            board={game.board}
            onWordClick={onWordClick}
            revealWords={
              game.state === GameStates.running &&
              (userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster)
            }
          />
        )}
        <div>Hint Word</div>
        <input
          style={{ width: 300, textAlign: "center" }}
          className={classes.pad}
          value={hintWord}
          onChange={event => setHintWord(event.target.value)}
        />
        <div>Hint Word Count</div>
        <input
          style={{ width: 300, textAlign: "center" }}
          className={classes.pad}
          value={hintWordCount}
          onChange={event => setHintWordCount(event.target.value)}
        />
        <Button variant="contained" className={classes.pad} onClick={sendHint}>
          SEND HINT
        </Button>
        <div>
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
        </div>
        {game ? showGame(game) : null}
      </div>
      <div className={classes.messages}>
        {socketMessages.map((s, i) => (
          <ul key={i}>{JSON.stringify(s)}</ul>
        ))}
      </div>
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
