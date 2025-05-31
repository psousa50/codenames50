import { GameModels } from "@codenames50/core"
import { Button, Paper, TextField, Box } from "@mui/material"
import * as R from "ramda"
import React from "react"
import { calculatedWidth, SmallButton, teamColor } from "../../../utils/styles"
import { Hint, Hint as HintModel } from "../../../utils/types"

interface SendHintProps {
  team: GameModels.Teams | undefined
  sendHint: (hint: Hint) => void
}

export const SendHint: React.FC<SendHintProps> = ({ team, sendHint }) => {
  const [hint, setHint] = React.useState<HintModel>({ word: "", count: 0 })

  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "row",
        width: calculatedWidth,
      }}
    >
      <Paper
        elevation={3}
        variant="outlined"
        sx={{
          border: `3px solid ${teamColor(team)}`,
          width: calculatedWidth,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
          }}
        >
          <TextField
            id="hint-word"
            label="Hint Word"
            value={hint.word}
            onChange={event => setHint({ ...hint, word: event.target.value })}
            sx={{
              width: "80%",
              marginRight: "10px",
              fontSize: "20px",
            }}
          />
          <Button
            variant="contained"
            disabled={hint.word.trim().length === 0 || hint.count === 0}
            color="primary"
            onClick={() => hint.count > 0 && sendHint(hint)}
          >
            Send Hint
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {R.range(1, 10).map(c => (
            <HintCount
              key={c}
              team={team}
              count={c}
              selected={c === hint.count}
              onChange={count => setHint({ ...hint, count })}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  )
}

interface HintCountProps {
  team: GameModels.Teams | undefined
  count: number
  selected: boolean
  onChange: (n: number) => void
}

const HintCount: React.FC<HintCountProps> = ({ team, count, selected, onChange }) => {
  return (
    <SmallButton
      size="small"
      disabled={onChange === undefined}
      variant={selected ? "contained" : "outlined"}
      onClick={() => onChange(count)}
      sx={{
        margin: "5px",
        color: teamColor(team),
      }}
    >
      {count}
    </SmallButton>
  )
}
