import { Grid, makeStyles, Theme } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import { GameModels } from "@codenames50/core"
import React from "react"
import { teamColor } from "../../../utils/styles"
import { TeamWordsLeft } from "./TeamWordsLeft"

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingLeft: "10px",
    paddingRight: "10px",
  },
  wordsLeft: {
    display: "flex",
    width: "20%",
    justifyContent: "center",
  },
  text: {
    userSelect: "none",
    fontWeight: "bold",
    textAlign: "center",
    width: "60%",
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
    <div className={classes.container}>
      <div className={classes.wordsLeft}>
        <TeamWordsLeft count={game.redTeam.wordsLeft} team={GameModels.Teams.red} />
      </div>
      <Typography variant="subtitle2" style={styles.teamColor} className={classes.text}>
        {text}
      </Typography>
      <div className={classes.wordsLeft}>
        <TeamWordsLeft count={game.blueTeam.wordsLeft} team={GameModels.Teams.blue} />
      </div>
    </div>
  )
}
