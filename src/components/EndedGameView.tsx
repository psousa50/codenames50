import { makeStyles, Theme, Typography } from "@material-ui/core"
import React from "react"
import { CodeNamesGame } from "../codenames-core/models"
import { teamColor } from "../utils/styles"
import { teamName } from "../utils/ui"
import { WordsBoardView } from "./WordsBoardView"

interface EndedGameViewProps {
  game: CodeNamesGame
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

export const EndedGameView: React.FC<EndedGameViewProps> = ({ game }) => {
  const classes = useStyles()
  const styles = {
    winText: {
      color: teamColor(game.winner),
    },
  }

  return (
    <div className={classes.container}>
      <WordsBoardView board={game.board} revealWords={true} />
      <div className={classes.container}>
        <Typography style={styles.winText} component="h1" variant="h5">
          {`${teamName(game.winner)} Wins!`}
        </Typography>
      </div>
    </div>
  )
}
