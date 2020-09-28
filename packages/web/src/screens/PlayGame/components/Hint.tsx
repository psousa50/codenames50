import { GameModels } from "@codenames50/core"
import { Button, makeStyles, Paper, Theme } from "@material-ui/core"
import React from "react"
import { calculatedWidth, teamColor } from "../../../utils/styles"
import { Hint as HintModel } from "../../../utils/types"

interface HintProps {
  team: GameModels.Teams | undefined
  hint: HintModel
  wordsRevealedCount: number
  canEndTurn: boolean
  endTurn: () => void
}

export const Hint: React.FC<HintProps> = ({ team, hint, wordsRevealedCount, endTurn, canEndTurn }) => {
  const classes = useStyles()

  const styles = {
    paper: {
      border: `3px solid ${teamColor(team)}`,
      width: calculatedWidth,
    },
  }

  return (
    <Paper elevation={3} variant="outlined" style={styles.paper} className={classes.container}>
      <div className={classes.hintWord}>{hint.word.toUpperCase()}</div>
      <div className={classes.hintWord}>
        {hint.count > 0
          ? `${hint.count}${
              wordsRevealedCount > 0
                ? ` (${
                    hint.count - wordsRevealedCount > 0
                      ? `${hint.count - wordsRevealedCount} remaining`
                      : "one more to try..."
                  })`
                : ""
            }`
          : ""}
      </div>
      <Button
        className={classes.button}
        variant="contained"
        disabled={!canEndTurn}
        color="primary"
        onClick={() => endTurn()}
      >
        End Turn
      </Button>
    </Paper>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "row",
    width: calculatedWidth,
    padding: "5px 10px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hintWord: {
    overflowWrap: "anywhere",
    padding: "3px 8px",
    [theme.breakpoints.down(300)]: {
      fontSize: "10px",
    },
    [theme.breakpoints.between(300, 600)]: {
      fontSize: "14px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "20px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "30px",
    },
  },
  button: {
    padding: "3px 8px",
    [theme.breakpoints.down(300)]: {
      fontSize: "8px",
    },
    [theme.breakpoints.between(300, 600)]: {
      fontSize: "10px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "12px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "14px",
    },
  },
}))
