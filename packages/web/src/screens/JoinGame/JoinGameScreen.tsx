import { GameModels } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import { Button, InputAdornment, TextField, Avatar, Container, Typography, Box } from "@mui/material"
import AccountCircle from "@mui/icons-material/AccountCircle"
import FastForward from "@mui/icons-material/FastForward"
import React from "react"
import { Navigate } from "react-router-dom"
import { logoImage } from "../../assets/images"
import { useGameMessaging } from "../../utils/useGameMessaging"

export interface JoinGameScreenProps {
  gameId: string
  userId: string
}

export const JoinGameScreen: React.FC<JoinGameScreenProps> = ({ gameId, userId: initialUserId }) => {
  const { connect, emitMessage, addMessageHandler, game, setGame } = useGameMessaging()
  const [userId, setUserId] = React.useState(initialUserId)

  React.useEffect(() => {
    connect()

    const onGameUpdated = (game: GameModels.CodeNamesGame) => {
      setGame(game)
    }

    const onJoinedGame = (input: { game: GameModels.CodeNamesGame }) => {
      setGame(input.game)
    }

    const setupMessageHandlers = () => {
      addMessageHandler(Messages.createGameMessagehandler("updateGame", onGameUpdated))
      addMessageHandler(Messages.createGameMessagehandler("joinedGame", onJoinedGame))
    }

    setupMessageHandlers()
  }, [addMessageHandler, connect, setGame])

  const joinGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (userId.trim().length > 0) {
      emitMessage(Messages.joinGame({ gameId, userId }))
    }
  }

  return game ? (
    <Navigate to={`/game?gameId=${gameId}&userId=${userId}`} replace />
  ) : (
    <form onSubmit={joinGame}>
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
            <FastForward />
          </Avatar>
          <Typography component="h1" variant="h5">
            Join game
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={userId.trim().length === 0}
            color="primary"
            sx={{ margin: "24px 0 16px" }}
            data-testid="join-game-button"
          >
            Join Game
          </Button>
        </Box>
      </Container>
    </form>
  )
}
