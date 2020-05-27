import { makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, Teams } from "../codenames-core/models"
import { WordsLeft } from "./WordsLeft"

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  wordsLeftContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordsLeft: {
    paddingLeft: theme.spacing(10),
    paddingRight: theme.spacing(10),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}))

interface WordsLeftViewProps {
  game: CodeNamesGame
}

export const WordsLeftView: React.FC<WordsLeftViewProps> = ({ game }) => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <div className={classes.wordsLeftContainer}>
        <div className={classes.wordsLeft}>
          <WordsLeft count={game.redTeam.wordsLeft} team={Teams.red} />
        </div>
        <div className={classes.wordsLeft}>
          <WordsLeft count={game.blueTeam.wordsLeft} team={Teams.blue} />
        </div>
      </div>
    </div>
  )
}
