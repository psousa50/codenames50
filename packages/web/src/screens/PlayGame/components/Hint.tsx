import { GameModels } from "@codenames50/core"
import { Button, Paper, Box } from "@mui/material"
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
  return (
    <Paper
      elevation={3}
      variant="outlined"
      sx={{
        border: `3px solid ${teamColor(team)}`,
        width: calculatedWidth,
        display: "flex",
        flexGrow: 1,
        flexDirection: "row",
        padding: "5px 10px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          overflowWrap: "anywhere",
          padding: "3px 8px",
          fontSize: {
            xs: "10px",
            sm: "20px",
            md: "30px",
          },
        }}
      >
        {hint.word.toUpperCase()}
      </Box>
      <Box
        sx={{
          overflowWrap: "anywhere",
          padding: "3px 8px",
          fontSize: {
            xs: "10px",
            sm: "20px",
            md: "30px",
          },
        }}
      >
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
      </Box>
      <Button
        variant="contained"
        disabled={!canEndTurn}
        color="primary"
        onClick={() => endTurn()}
        sx={{
          padding: "3px 8px",
          fontSize: {
            xs: "8px",
            sm: "12px",
            md: "14px",
          },
        }}
      >
        End Turn
      </Button>
    </Paper>
  )
}
