import { Button, InputAdornment, makeStyles, Snackbar, TextField } from "@material-ui/core"
import Avatar from "@material-ui/core/Avatar"
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Typography from "@material-ui/core/Typography"
import AccountCircle from "@material-ui/icons/AccountCircle"
import NoteAdd from "@material-ui/icons/NoteAdd"
import { Alert, AlertTitle } from "@material-ui/lab"
import React from "react"
import { Redirect, useHistory } from "react-router-dom"
import { CodeNamesGame } from "../codenames-core/models"
import * as Messages from "../messaging/messages"
import { useSocket } from "../utils/hooks"

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  margin: {
    margin: theme.spacing(1),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

export interface CreateGameViewProps {
  userId?: string
}

export const CreateGameView: React.FC<CreateGameViewProps> = ({ userId: initialUserId }) => {
  const classes = useStyles()
  const history = useHistory()
  const [socket] = useSocket(process.env.SERVER_URL || "http://localhost:3001", { autoConnect: false })
  const [error, setError] = React.useState("")
  const [gameId, setGameId] = React.useState<string | undefined>()
  const [userId, setUserId] = React.useState(initialUserId || "")
  const [joining, setJoining] = React.useState(false)

  const emitMessage = <T extends {}>(socket: SocketIOClient.Socket, message: Messages.GameMessage<T>) => {
    setError("")
    socket.emit(message.type, message.data)
  }

  const addMessageHandler = <T extends {}>(
    socket: SocketIOClient.Socket,
    type: Messages.GameMessageType,
    handler: (data: T) => void,
  ) => {
    socket.on(type, handler)
  }

  const createGame = () => {
    if (canCreate()) {
      emitMessage(socket, Messages.registerUserSocket({ userId }))
      emitMessage(socket, Messages.createGame({ userId, language: "en" }))
    }
  }

  const canCreate = () => gameId && userId.trim().length > 0

  const joinGame = () => {
    setJoining(true)
  }

  React.useEffect(() => {
    socket.connect()
    console.log("CONNECT")
  }, [socket])

  React.useEffect(() => {
    const gameCreatedHandler = (game: CodeNamesGame) => {
      setGameId(game.gameId)
    }

    addMessageHandler(socket, "gameCreated", gameCreatedHandler)
  }, [history, socket, userId])

  const handleClose = () => {
    setError("")
  }

  function SignIn() {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <NoteAdd />
          </Avatar>
          <Typography component="h1" variant="h5">
            Create a game
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            className={classes.margin}
            id="used-id"
            label="Your Name"
            value={userId}
            onChange={event => setUserId(event.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={() => {
              createGame()
            }}
          >
            Create Game
          </Button>
          <Button
            size="small"
            color="secondary"
            className={classes.submit}
            onClick={() => {
              joinGame()
            }}
          >
            Join a Game instead
          </Button>
        </div>
      </Container>
    )
  }

  return gameId ? (
    <Redirect to={`/game?gameId=${gameId}&userId=${userId}`} />
  ) : joining ? (
    <Redirect to={`/join?gameId=${gameId || ""}&userId=${userId || ""}`} />
  ) : (
    <>
      <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={handleClose}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>
      <SignIn />
    </>
  )
}
