import { Theme } from "@material-ui/core"
import { common } from "@material-ui/core/colors"
import { createStyles, makeStyles } from "@material-ui/styles"
import React from "react"
import { Teams } from "../codenames-core/models"
import { teamColor } from "../utils/styles"

interface WordsLeftProps {
  team?: Teams
  count?: number
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    count: {
      display: "flex",
      width: theme.spacing(6),
      height: theme.spacing(6),
      borderRadius: "50%",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 32,
      color: common.white,
    },
  }),
)

export const WordsLeft: React.FC<WordsLeftProps> = ({ count, team }) => {
  const classes = useStyles()

  const styles = {
    count: {
      backgroundColor: teamColor(team),
    },
  }

  return count !== undefined ? (
    <div style={styles.count} className={classes.count}>
      {count.toString()}
    </div>
  ) : null
}
