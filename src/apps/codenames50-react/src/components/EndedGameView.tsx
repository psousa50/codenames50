import { Button, makeStyles, Theme } from "@material-ui/core"
import { CodeNamesGame } from "@psousa50/codenames50-core/lib/models"
import React from "react"
import { teamName } from "../utils/ui"
import { WordsBoardView } from "./WordsBoardView"
import { WordsLeftView } from "./WordsLeftView"

interface EndedGameViewProps {
  userId: string
  game: CodeNamesGame
  newGame: () => void
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

export const EndedGameView: React.FC<EndedGameViewProps> = ({ userId, game, newGame }) => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <WordsLeftView game={game} text={`${teamName(game.winner)} Wins!`} team={game.winner} />
      <div style={{ marginTop: 20 }}></div>
      <WordsBoardView userId={userId} game={game} board={game.board} revealWords={true} />
      <div style={{ marginTop: 20 }}></div>
      <Button variant="contained" size="small" color="primary" onClick={() => newGame()}>
        New Game
      </Button>
    </div>
  )
}
