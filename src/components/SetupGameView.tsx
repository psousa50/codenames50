import { Button, Grid } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, Teams } from "../codenames-core/models"
import { TeamsView } from "./TeamsView"

interface SetupGameViewProps {
  game: CodeNamesGame
  joinTeam: (team: Teams) => void
  setSpyMaster: () => void
  startGame: () => void
}

export const SetupGameView: React.FC<SetupGameViewProps> = ({ game, joinTeam, setSpyMaster, startGame }) => {
  return (
    <Grid container spacing={0} direction="column" alignItems="center" justify="center">
      <Button size="small" color="secondary" onClick={() => setSpyMaster()}>
        I'm Spy Master!
      </Button>
      <TeamsView game={game} joinTeam={joinTeam} />
      <Button size="small" color="primary" onClick={() => startGame()}>
        start Game
      </Button>
    </Grid>
  )
}
