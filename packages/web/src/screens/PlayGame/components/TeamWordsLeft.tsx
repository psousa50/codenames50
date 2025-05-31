import { Box, Typography } from "@mui/material"
import React from "react"
import { GameModels } from "@codenames50/core"

export interface TeamWordsLeftProps {
  team: GameModels.Teams
  wordsLeft: number
}

export const TeamWordsLeft: React.FC<TeamWordsLeftProps> = ({ team, wordsLeft }) => {
  const teamColor = team === GameModels.Teams.red ? "#f8931f" : "#1b74ca"

  return (
    <Box
      sx={{
        width: 50,
        height: 50,
        borderRadius: "50%",
        backgroundColor: teamColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        flexShrink: 0,
        margin: 0,
        padding: 0,
      }}
    >
      <Typography
        sx={{
          color: "white",
          fontWeight: "00",
          fontSize: "30px",
          userSelect: "none",
          lineHeight: 1,
          textAlign: "center",
          margin: 0,
          padding: 0,
        }}
      >
        {wordsLeft}
      </Typography>
    </Box>
  )
}
