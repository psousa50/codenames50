import { GameModels } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import {
  Button,
  CircularProgress,
  InputAdornment,
  Snackbar,
  TextField,
  Avatar,
  Container,
  Typography,
  Box,
  Alert,
  AlertTitle,
} from "@mui/material"
import AccountCircle from "@mui/icons-material/AccountCircle"
import NoteAdd from "@mui/icons-material/NoteAdd"
import React from "react"
import { Navigate } from "react-router-dom"
import { logoImage } from "../../assets/images"
import { useGameMessaging } from "../../utils/useGameMessaging"

export interface CreateGameScreenProps {
  userId?: string
}

export const CreateGameScreen: React.FC<CreateGameScreenProps> = ({ userId: initialUserId }) => {
  const { connect, emitMessage, addMessageHandler, game, setGame, error, clearError } = useGameMessaging()
  const [userId, setUserId] = React.useState(initialUserId || "")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    connect()

    const onGameCreated = (game: GameModels.CodeNamesGame) => {
      setGame(game)
    }

    const setupMessageHandlers = () => {
      addMessageHandler(Messages.createGameMessagehandler("gameCreated", onGameCreated))
    }

    setupMessageHandlers()
  }, [addMessageHandler, connect, setGame])

  const createGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (userId.trim().length > 0) {
      setLoading(true)
      emitMessage(Messages.createGame({ userId }))
    }
  }

  function SignIn() {
    return (
      <form onSubmit={createGame}>
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="codenames 50"
              sx={{
                padding: "50px",
                width: "100%",
              }}
            />
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
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
              sx={{ m: 1 }}
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
            <Box sx={{ m: 1, position: "relative" }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || userId.trim().length === 0}
                color="primary"
                sx={{ margin: "24px 0 16px" }}
                data-testid="create-game-button"
              >
                Create Game
              </Button>
              {loading && (
                <CircularProgress
                  size={32}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              )}
            </Box>
          </Box>
        </Container>
      </form>
    )
  }

  return game && userId ? (
    <Navigate to={`/game?gameId=${game.gameId}&userId=${userId}`} replace />
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
