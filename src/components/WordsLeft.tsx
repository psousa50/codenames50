import { Theme } from "@material-ui/core"
import { common } from "@material-ui/core/colors"
import Typography from "@material-ui/core/Typography"
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
      width: "min(50px, 12vw)",
      height: "min(50px, 12vw)",
      borderRadius: "50%",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
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
    <Typography variant="h4" style={styles.count} className={classes.count}>
      {count.toString()}
    </Typography>
  ) : null
}
