import { Button, makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame } from "../codenames-core/models"
import { teamName } from "../utils/ui"
import { WordsBoardView } from "./WordsBoardView"
import { WordsLeftView } from "./WordsLeftView"

interface EndedGameViewProps {
  userId: string
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

export const EndedGameView: React.FC<EndedGameViewProps> = ({ userId, game, nextGame }) => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <WordsLeftView game={game} text={`${teamName(game.winner)} Wins!`} team={game.winner} />
      <WordsBoardView userId={userId} game={game} board={game.board} revealWords={true} />
      <Button size="small" color="secondary" onClick={() => nextGame()}>
        New Game
      </Button>
    </div>
  )
}
