import { Button, makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame } from "../codenames-core/models"
import { teamColor } from "../utils/styles"
import { teamName } from "../utils/ui"
import { WordsBoardView } from "./WordsBoardView"
import { WordsLeftView } from "./WordsLeftView"

interface EndedGameViewProps {
  game: CodeNamesGame
  nextGame: () => void
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column" as "column",
    alignItems: "center",
    padding: "10px 10px",
  },
}))

export const EndedGameView: React.FC<EndedGameViewProps> = ({ game, nextGame }) => {
  const classes = useStyles()
  const styles = {
    winText: {
      color: teamColor(game.winner),
    },
  }

  return (
    <div className={classes.container}>
      <WordsLeftView game={game} text={`${teamName(game.winner)} Wins!`} team={game.winner} />
      <WordsBoardView board={game.board} revealWords={true} />
      <Button size="small" color="secondary" onClick={() => nextGame()}>
        Next Game
      </Button>
    </div>
  )
}
