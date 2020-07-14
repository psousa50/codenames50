import { GameModels } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import { Button, CircularProgress, InputAdornment, makeStyles, Snackbar, TextField } from "@material-ui/core"
import Avatar from "@material-ui/core/Avatar"
import Container from "@material-ui/core/Container"
import Typography from "@material-ui/core/Typography"
import AccountCircle from "@material-ui/icons/AccountCircle"
import NoteAdd from "@material-ui/icons/NoteAdd"
import { Alert, AlertTitle } from "@material-ui/lab"
import React from "react"
import { Redirect } from "react-router-dom"
import { logoImage } from "../../assets/images"
import { useGameMessaging } from "../../utils/useGameMessaging"

export interface CreateGameScreenProps {
  userId?: string
}

export const CreateGameScreen: React.FC<CreateGameScreenProps> = ({ userId: initialUserId }) => {
  const classes = useStyles()

  const { emitMessage, addMessageHandler, game, setGame, error, clearError } = useGameMessaging()
  const [userId, setUserId] = React.useState(initialUserId || "")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const onGameCreated = (game: GameModels.CodeNamesGame) => {
      setGame(game)
    }

    const setupMessageHandlers = () => {
      addMessageHandler(Messages.createGameMessagehandler("gameCreated", onGameCreated))
    }

    setupMessageHandlers()
  }, [addMessageHandler, setGame])

  const createGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (userId.trim().length > 0) {
      setLoading(true)
      emitMessage(Messages.registerUserSocket({ userId }))
      emitMessage(Messages.createGame({ userId }))
    }
  }

  function SignIn() {
    return (
      <form onSubmit={createGame}>
        <Container component="main" maxWidth="xs">
          <div className={classes.paper}>
            <img src={logoImage} alt="codenames 50" className={classes.logo} />
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
              id="user-id"
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
            <div className={classes.wrapper}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || userId.trim().length === 0}
                color="primary"
                className={classes.submit}
                data-testid="create-game-button"
              >
                Create Game
              </Button>
              {loading && <CircularProgress size={32} className={classes.buttonProgress} />}
            </div>
          </div>
        </Container>
      </form>
    )
  }

  return game && userId ? (
    <Redirect to={`/game?gameId=${game.gameId}&userId=${userId}`} />
  ) : (
    <>
      <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={() => clearError()}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>
      <SignIn />
    </>
  )
}

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    padding: "50px",
    width: "100%",
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
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}))
