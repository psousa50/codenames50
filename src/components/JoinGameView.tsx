import { Button, InputAdornment, makeStyles, TextField } from "@material-ui/core"
import Avatar from "@material-ui/core/Avatar"
import { common } from "@material-ui/core/colors"
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Typography from "@material-ui/core/Typography"
import AccountCircle from "@material-ui/icons/AccountCircle"
import FastForward from "@material-ui/icons/FastForward"
import Games from "@material-ui/icons/Games"
import React from "react"
import { Redirect } from "react-router-dom"

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: common.white,
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

export interface JoinGameViewProps {
  gameId?: string
  userId?: string
}

export const JoinGameView: React.FC<JoinGameViewProps> = ({ userId: initialUserId, gameId: initialGameId }) => {
  const classes = useStyles()
  const [gameId, setGameId] = React.useState(initialGameId || "")
  const [userId, setUserId] = React.useState(initialUserId || "")
  const [joining, setJoining] = React.useState(false)

  const canJoin = () => userId.trim().length > 0 && gameId.trim().length > 0

  const joinGame = () => {
    setJoining(true)
  }

  return joining ? (
    <Redirect to={`/game?gameId=${gameId || ""}&userId=${userId || ""}`} />
  ) : (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
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
          id="used-id"
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
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          className={classes.margin}
          id="game-id"
          label="Game ID"
          value={gameId}
          onChange={event => setGameId(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Games />
              </InputAdornment>
            ),
          }}
        />
        <Button
          disabled={!canJoin()}
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={() => {
            joinGame()
          }}
        >
          Join Game
        </Button>
      </div>
    </Container>
  )
}
