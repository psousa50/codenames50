import { Hint as HintModel } from "../../../utils/types"
import { GameModels } from "@codenames50/core"
import { Button, makeStyles, Paper, TextField, Theme } from "@material-ui/core"
import * as R from "ramda"
import React from "react"
import { exists } from "../../../utils/misc"
import { calculatedWidth, SmallButton, teamColor } from "../../../utils/styles"
import { Hint } from "../../../utils/types"
import { TimeLeft } from "./TimeLeft"

interface SendHintProps {
  team: GameModels.Teams | undefined
  startedTime: number
  turnTimeoutSec: number | undefined
  sendHint: (hint: Hint) => void
  onTimeout: () => void
}

export const SendHint: React.FC<SendHintProps> = ({ team, turnTimeoutSec, startedTime, sendHint, onTimeout }) => {
  const classes = useStyles()

  const [hint, setHint] = React.useState<HintModel>({ word: "", count: 0, startedTime })

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
            onChange={event => setHint({ ...hint, word: event.target.value })}
            inputProps={{ maxLength: 30 }}
          />
          {exists(turnTimeoutSec) && exists(hint.startedTime) ? (
            <TimeLeft started={hint.startedTime!} turnTimeoutSec={turnTimeoutSec!} onTimeout={onTimeout} />
          ) : null}
          <Button
            variant="contained"
            disabled={hint.word.trim().length === 0 || hint.count === 0}
            color="primary"
            onClick={() => hint.count > 0 && sendHint(hint)}
          >
            Send Hint
          </Button>
        </div>
        <div className={classes.numbers}>
          {R.range(1, 10).map(c => (
            <HintCount
              key={c}
              team={team}
              count={c}
              selected={c === hint.count}
              onChange={count => setHint({ ...hint, count })}
            />
          ))}
        </div>
      </Paper>
    </div>
  )
}

interface HintCountProps {
  team: GameModels.Teams | undefined
  count: number
  selected: boolean
  onChange: (n: number) => void
}

const HintCount: React.FC<HintCountProps> = ({ team, count, selected, onChange }) => {
  const classes = useStyles()

  const styles = {
    teamColor: {
      color: teamColor(team),
    },
  }
  return (
    <SmallButton
      size="small"
      disabled={onChange === undefined}
      className={classes.number}
      variant={selected ? "contained" : "outlined"}
      style={styles.teamColor}
      onClick={() => onChange(count)}
    >
      {count}
    </SmallButton>
  )
}

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
