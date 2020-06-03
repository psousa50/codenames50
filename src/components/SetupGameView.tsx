import { Button, Grid, makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, GameStates, Teams } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { TeamsView } from "./TeamsView"

const useStyles = makeStyles((theme: Theme) => ({
  buttons: {
    display: "flex",
    flow: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing(3),
  },
}))

interface SetupGameViewProps {
  userId: string
  game: CodeNamesGame
  joinTeam: (team: Teams) => void
  setSpyMaster: (team: Teams) => void
  startGame: () => void
  nextGame: () => void
}

export const SetupGameView: React.FC<SetupGameViewProps> = ({
  userId,
  game,
  joinTeam,
  setSpyMaster,
  startGame,
  nextGame,
}) => {
  const classes = useStyles()

  const canStartGame = GameRules.startGame(game) === undefined

  return (
    <Grid container spacing={0} direction="column" alignItems="center" justify="center">
      <TeamsView userId={userId} game={game} joinTeam={joinTeam} setSpyMaster={setSpyMaster} />
      <div className={classes.buttons}>
        <Button variant="contained" disabled={!canStartGame} size="small" color="primary" onClick={() => startGame()}>
          Start Game
        </Button>
        <Button
          disabled={game.state === GameStates.idle}
          variant="contained"
          size="small"
          color="primary"
          onClick={() => nextGame()}
        >
          New Game
        </Button>
      </div>
    </Grid>
  )
}
