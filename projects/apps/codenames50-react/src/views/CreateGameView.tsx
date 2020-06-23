import { Button, InputAdornment, makeStyles, Snackbar, TextField } from "@material-ui/core"
import Avatar from "@material-ui/core/Avatar"
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Typography from "@material-ui/core/Typography"
import AccountCircle from "@material-ui/icons/AccountCircle"
import NoteAdd from "@material-ui/icons/NoteAdd"
import { Alert, AlertTitle } from "@material-ui/lab"
import * as Messages from "codenames50-messaging/lib/messages"
import React from "react"
import { Redirect } from "react-router-dom"
import { useGameMessaging } from "../utils/useGameMessaging"

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

  const { emitMessage, game, error, setError } = useGameMessaging()
  const [userId, setUserId] = React.useState(initialUserId || "")

  const createGame = () => {
    if (userId.trim().length > 0) {
      emitMessage(Messages.registerUserSocket({ userId }))
      emitMessage(Messages.createGame({ userId }))
    }
  }

  const handleErrorClose = () => {
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
            required
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
        </div>
      </Container>
    )
  }

  return game && userId ? (
    <Redirect to={`/game?gameId=${game.gameId}&userId=${userId}`} />
  ) : (
    <>
      <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={handleErrorClose}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>
      <SignIn />
    </>
  )
}
