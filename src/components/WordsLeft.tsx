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
      width: "min(50px, 12vw)",
      height: "min(50px, 12vw)",
      borderRadius: "50%",
      alignItems: "center",
      justifyContent: "center",
      [theme.breakpoints.down(300)]: {
        fontSize: "12px",
      },
      [theme.breakpoints.between(300, 600)]: {
        fontSize: "14px",
      },
      [theme.breakpoints.up("sm")]: {
        fontSize: "20px",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "32px",
      },
      [theme.breakpoints.up("lg")]: {
        fontSize: "40px",
      },
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
