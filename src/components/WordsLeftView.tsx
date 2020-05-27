import { makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, Teams } from "../codenames-core/models"
import { teamColor } from "../utils/styles"
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
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
}))

interface WordsLeftViewProps {
  game: CodeNamesGame
  text?: string
  team?: Teams
}

export const WordsLeftView: React.FC<WordsLeftViewProps> = ({ game, text, team }) => {
  const classes = useStyles()

  const styles = {
    teamColor: {
      color: teamColor(team),
    },
  }

  return (
    <div className={classes.container}>
      <div className={classes.wordsLeftContainer}>
        <div className={classes.wordsLeft}>
          <WordsLeft count={game.redTeam.wordsLeft} team={Teams.red} />
        </div>
        {text && (
          <div style={styles.teamColor} className={classes.text}>
            {text}
          </div>
        )}
        <div className={classes.wordsLeft}>
          <WordsLeft count={game.blueTeam.wordsLeft} team={Teams.blue} />
        </div>
      </div>
    </div>
  )
}
