import { Grid, makeStyles, Theme } from "@material-ui/core"
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
    userSelect: "none",
    [theme.breakpoints.down(300)]: {
      fontSize: "12px",
    },
    [theme.breakpoints.between(300, 600)]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "26px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "32px",
    },
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
    <Grid container direction="row" justify="space-evenly" alignItems="center">
      <Grid item>
        <WordsLeft count={game.redTeam.wordsLeft} team={Teams.red} />
      </Grid>
      <Grid item>
        <div style={styles.teamColor} className={classes.text}>
          {text}
        </div>
      </Grid>
      <Grid item>
        <WordsLeft count={game.blueTeam.wordsLeft} team={Teams.blue} />
      </Grid>
    </Grid>
  )
}
