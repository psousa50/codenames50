import { Grid, makeStyles, Theme } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import { GameModels } from "@codenames50/core"
import React from "react"
import { teamColor } from "../../../utils/styles"
import { TeamWordsLeft } from "./TeamWordsLeft"

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
    fontWeight: "bold",
  },
}))

interface WordsLeftProps {
  game: GameModels.CodeNamesGame
  text?: string
  team?: GameModels.Teams
}

export const WordsLeft: React.FC<WordsLeftProps> = ({ game, text, team }) => {
  const classes = useStyles()

  const styles = {
    teamColor: {
      color: teamColor(team),
    },
  }

  return (
    <Grid container direction="row" justify="space-evenly" alignItems="center">
      <Grid item>
        <TeamWordsLeft count={game.redTeam.wordsLeft} team={GameModels.Teams.red} />
      </Grid>
      <Grid item>
        <Typography variant="h4" style={styles.teamColor} className={classes.text}>
          {text}
        </Typography>
      </Grid>
      <Grid item>
        <TeamWordsLeft count={game.blueTeam.wordsLeft} team={GameModels.Teams.blue} />
      </Grid>
    </Grid>
  )
}
