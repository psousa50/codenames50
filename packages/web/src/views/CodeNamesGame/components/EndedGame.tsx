import { GameModels } from "@codenames50/core"
import { Button, makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { teamName } from "../../../utils/ui"
import { WordsBoard } from "./WordsBoard"
import { WordsLeft } from "./WordsLeft"

interface EndedGameProps {
  userId: string
  game: GameModels.CodeNamesGame
  newGame: () => void
}

export const EndedGame: React.FC<EndedGameProps> = ({ userId, game, newGame }) => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <WordsLeft game={game} text={`${teamName(game.winner)} Wins!`} team={game.winner} />
      <div style={{ marginTop: 20 }}></div>
      <WordsBoard userId={userId} game={game} board={game.board} revealWords={true} />
      <div style={{ marginTop: 20 }}></div>
      <Button variant="contained" size="small" color="primary" onClick={() => newGame()}>
        New Game
      </Button>
    </div>
  )
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
