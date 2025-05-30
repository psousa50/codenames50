import { Button, InputAdornment, makeStyles, TextField } from "@material-ui/core"
import Avatar from "@material-ui/core/Avatar"
import Container from "@material-ui/core/Container"
import Typography from "@material-ui/core/Typography"
import AccountCircle from "@material-ui/icons/AccountCircle"
import FastForward from "@material-ui/icons/FastForward"
import React from "react"
import { Navigate } from "react-router-dom"
import { logoImage } from "../../assets/images"
import { GameModels } from "@codenames50/core"

export interface JoinGameScreenProps {
  gameId: string
  userId: string
}

export const JoinGameScreen: React.FC<JoinGameScreenProps> = ({ userId: initialUserId, gameId }) => {
  const classes = useStyles()
  const [userId, setUserId] = React.useState(initialUserId || "")
  const [game, setGame] = React.useState<GameModels.CodeNamesGame | null>(null)

  const canJoin = () => userId.trim().length > 0 && gameId.trim().length > 0

  const joinGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canJoin()) {
      // For testing purposes, simulate joining the game
      setGame({ gameId } as GameModels.CodeNamesGame)
    }
  }

  return game ? (
    <Navigate to={`/game?gameId=${gameId || ""}&userId=${userId || ""}`} replace />
  ) : (
    <form onSubmit={joinGame}>
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <img src={logoImage} alt="codenames 50" className={classes.logo} />
          <Avatar className={classes.avatar}>
            <FastForward />
          </Avatar>
          <Typography component="h1" variant="h5">
            Join a game
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            className={classes.margin}
            id="user-id"
            label="Your Name"
            value={userId}
            onChange={event => setUserId(event.target.value)}
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
            disabled={!canJoin()}
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            data-testid="join-game-button"
          >
            Join Game
          </Button>
        </div>
      </Container>
    </form>
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
