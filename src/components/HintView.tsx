import { Button, makeStyles, Paper, TextField, Theme } from "@material-ui/core"
import { common, purple } from "@material-ui/core/colors"
import * as R from "ramda"
import React from "react"

const useStyles = makeStyles((theme: Theme) => ({
  hint: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "space-between",
    padding: "10px 10px",
  },
  hintWord: {
    display: "flex",
    fontSize: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  numbers: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  number: {
    maxWidth: theme.spacing(20),
    maxHeight: theme.spacing(20),
    margin: "5px",
    fontSize: 14,
    marginBottom: "30px",
  },
}))

interface HintViewProps {
  hintWord: string
  hintWordCount: number | undefined
  onChange?: (hintWord: string, hintWordCount?: number) => void
  sendHint?: (hintWord: string, hintWordCount: number) => void
}

export const HintView: React.FC<HintViewProps> = ({ hintWord, hintWordCount, onChange, sendHint }) => {
  const classes = useStyles()

  return (
    <Paper elevation={3} variant="outlined" style={{ marginTop: "20px" }}>
      {sendHint ? (
        <div className={classes.hint}>
          <TextField
            id="hint-word"
            label="Hint Word"
            value={hintWord}
            onChange={event => onChange && onChange(event.target.value, hintWordCount)}
            autoFocus
          />
          <Button color="primary" onClick={() => hintWordCount && sendHint && sendHint(hintWord, hintWordCount)}>
            Send Hint
          </Button>
        </div>
      ) : (
        <div className={classes.hintWord}>{hintWord}</div>
      )}
      <div className={classes.numbers}>
        {R.range(1, 9).map(c => (
          <HintCount
            key={c}
            count={c}
            selected={c === hintWordCount}
            onChange={onChange ? count => onChange(hintWord, count) : undefined}
          />
        ))}
      </div>
    </Paper>
  )
}

interface HintCountProps {
  count: number
  selected: boolean
  onChange?: (n: number) => void
}

const HintCount: React.FC<HintCountProps> = ({ count, selected, onChange }) => {
  const classes = useStyles()

  const styles = {
    root: {
      cursor: onChange ? "pointer" : "default",
      ...(selected && {
        backgroundColor: purple[500],
        color: common.white,
      }),
    },
  }

  // return (
  //   <div style={styles.root} className={classes.number} onClick={() => onChange && onChange(n)}>
  //     {n}
  //   </div>
  // )
  return (
    <Button
      disabled={onChange === undefined}
      className={classes.number}
      variant={selected ? "contained" : "outlined"}
      color="secondary"
      onClick={() => onChange && onChange(count)}
    >
      {count}
    </Button>
  )
}
