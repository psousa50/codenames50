import { Button, makeStyles, Paper, TextField, Theme } from "@material-ui/core"
import * as R from "ramda"
import React from "react"
import { Teams } from "../codenames-core/models"
import { calculatedWidth, SmallButton, teamColor } from "../utils/styles"
import { Hint } from "./types"

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "row",
    width: calculatedWidth,
  },
  hint: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
  },
  hintWord: {
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "20px",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: "24px",
    },
    alignItems: "center",
    justifyContent: "center",
  },
  numbers: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    [theme.breakpoints.down("sm")]: {
      fontSize: "10px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "14px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: "18px",
    },
    margin: "5px",
  },
}))

interface HintViewProps {
  team: Teams | undefined
  hint: Hint
  canEndTurn: boolean
  onChange?: (hint: Hint) => void
  sendHint?: (hint: Hint) => void
  endTurn?: () => void
}

export const HintView: React.FC<HintViewProps> = ({ team, hint, onChange, sendHint, endTurn, canEndTurn }) => {
  const classes = useStyles()

  const styles = {
    paper: {
      border: `3px solid ${teamColor(team)}`,
      width: calculatedWidth,
    },
  }

  return (
    <div className={classes.container}>
      <Paper elevation={3} variant="outlined" style={styles.paper}>
        <div className={classes.hint}>
          {sendHint ? (
            <>
              <TextField
                id="hint-word"
                label="Hint Word"
                value={hint.word}
                onChange={event => onChange && onChange({ ...hint, word: event.target.value })}
              />
              <Button
                variant="contained"
                disabled={hint.word.trim().length === 0 || hint.count === undefined}
                color="primary"
                onClick={() => hint.count && sendHint && sendHint(hint)}
              >
                Send Hint
              </Button>
            </>
          ) : (
            <>
              <div className={classes.hintWord}>{hint.word}</div>
              <Button variant="contained" disabled={!canEndTurn} color="primary" onClick={() => endTurn && endTurn()}>
                End Turn
              </Button>
            </>
          )}
        </div>
        <div className={classes.numbers}>
          {R.range(1, 10).map(c => (
            <HintCount
              key={c}
              count={c}
              selected={c === hint.count}
              onChange={onChange ? count => onChange({ ...hint, count }) : undefined}
            />
          ))}
        </div>
      </Paper>
    </div>
  )
}

interface HintCountProps {
  count: number
  selected: boolean
  onChange?: (n: number) => void
}

const HintCount: React.FC<HintCountProps> = ({ count, selected, onChange }) => {
  const classes = useStyles()

  return (
    <SmallButton
      size="small"
      disabled={onChange === undefined}
      className={classes.number}
      variant={selected ? "contained" : "outlined"}
      color="secondary"
      onClick={() => onChange && onChange(count)}
    >
      {count}
    </SmallButton>
  )
}
