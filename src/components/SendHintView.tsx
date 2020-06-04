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
  numbers: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    margin: "5px",
  },
}))

interface SendHintViewProps {
  team: Teams | undefined
  hint: Hint
  onChange: (hint: Hint) => void
  sendHint: (hint: Hint) => void
}

export const SendHintView: React.FC<SendHintViewProps> = ({ team, hint, onChange, sendHint }) => {
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
            onClick={() => hint.count && sendHint(hint)}
          >
            Send Hint
          </Button>
        </div>
        <div className={classes.numbers}>
          {R.range(1, 10).map(c => (
            <HintCount key={c} count={c} selected={c === hint.count} onChange={count => onChange({ ...hint, count })} />
          ))}
        </div>
      </Paper>
    </div>
  )
}

interface HintCountProps {
  count: number
  selected: boolean
  onChange: (n: number) => void
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
      onClick={() => onChange(count)}
    >
      {count}
    </SmallButton>
  )
}
