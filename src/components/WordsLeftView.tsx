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
      width: theme.spacing(8),
      height: theme.spacing(8),
      border: `1px solid black`,
      borderRadius: "50%",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 40,
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

  return count ? (
    <div style={styles.count} className={classes.count}>
      {count.toString()}
    </div>
  ) : null
}
