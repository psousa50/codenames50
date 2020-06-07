import { Button, makeStyles, Paper, Theme } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import React from "react"
import { Teams } from "../codenames-core/models"
import { exists } from "../utils/misc"
import { calculatedWidth, teamColor } from "../utils/styles"
import { Hint } from "../utils/types"
import { TimeLeft } from "./TimeLeft"

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
    display: "flex",
    userSelect: "none",
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    margin: "5px",
  },
}))

interface HintViewProps {
  team: Teams | undefined
  hint: Hint
  responseTimeoutSec: number | undefined
  canEndTurn: boolean
  endTurn: () => void
  onTimeout: () => void
}

export const HintView: React.FC<HintViewProps> = ({
  team,
  hint,
  responseTimeoutSec,
  endTurn,
  canEndTurn,
  onTimeout,
}) => {
  const classes = useStyles()

  const styles = {
    paper: {
      border: `3px solid ${teamColor(team)}`,
      width: calculatedWidth,
    },
  }

  return (
    <Paper elevation={3} variant="outlined" style={styles.paper} className={classes.container}>
      <Typography variant="h4">{hint.word.toUpperCase()}</Typography>
      <Typography variant="h4">{hint.count > 0 ? hint.count : ""}</Typography>
      {exists(responseTimeoutSec) && exists(hint.startedTime) ? (
        <TimeLeft started={hint.startedTime!} responseTimeoutSec={responseTimeoutSec!} onTimeout={onTimeout} />
      ) : null}
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
