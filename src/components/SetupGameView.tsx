import { Button, Grid } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, GameStates, Teams } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { TeamsView } from "./TeamsView"

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
  const canStartGame = GameRules.startGame(game) === undefined

  return (
    <Grid container spacing={0} direction="column" alignItems="center" justify="center">
      <TeamsView userId={userId} game={game} joinTeam={joinTeam} setSpyMaster={setSpyMaster} />
      {game.state === GameStates.idle ? (
        <Button disabled={!canStartGame} size="small" color="primary" onClick={() => startGame()}>
          Start Game
        </Button>
      ) : (
        <Button size="small" color="primary" onClick={() => nextGame()}>
          New Game
        </Button>
      )}
    </Grid>
  )
}
