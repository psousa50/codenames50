import { Button, makeStyles, Paper, Theme } from "@material-ui/core"
import React from "react"
import { Teams } from "../codenames-core/models"
import { calculatedWidth, teamColor } from "../utils/styles"
import { Hint } from "./types"

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "row",
    width: calculatedWidth,
    padding: "5px 10px",
    justifyContent: "space-between",
  },
  hintWord: {
    display: "flex",
    userSelect: "none",
    [theme.breakpoints.down("sm")]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "20px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "24px",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: "28px",
    },
    alignItems: "center",
    justifyContent: "center",
  },

  number: {
    [theme.breakpoints.down("sm")]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "20px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "24px",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: "28px",
    },
    margin: "5px",
  },
}))

interface HintViewProps {
  team: Teams | undefined
  hint: Hint
  canEndTurn: boolean
  endTurn: () => void
}

export const HintView: React.FC<HintViewProps> = ({ team, hint, endTurn, canEndTurn }) => {
  const classes = useStyles()

  const styles = {
    paper: {
      border: `3px solid ${teamColor(team)}`,
      width: calculatedWidth,
    },
  }

  return (
    <Paper elevation={3} variant="outlined" style={styles.paper} className={classes.container}>
      <div className={classes.hintWord}>{hint.word}</div>
      <div className={classes.number}>{hint.count > 0 ? hint.count : ""}</div>
      <Button variant="contained" disabled={!canEndTurn} color="primary" onClick={() => endTurn()}>
        End Turn
      </Button>
    </Paper>
  )
}

interface HintCountProps {
  count: number
  selected: boolean
  onChange?: (n: number) => void
}
