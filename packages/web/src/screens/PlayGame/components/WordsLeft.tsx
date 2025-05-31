import { GameModels } from "@codenames50/core"
import { Typography, Box } from "@mui/material"
import React from "react"
import { teamColor } from "../../../utils/styles"
import { TeamWordsLeft } from "./TeamWordsLeft"

interface WordsLeftProps {
  game: GameModels.CodeNamesGame
  text?: string
  team?: GameModels.Teams
}

export const WordsLeft: React.FC<WordsLeftProps> = ({ game, text, team }) => {
  const isInterceptionVariant = game.config.variant === GameModels.GameVariant.interception

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        paddingLeft: "20px",
        paddingRight: "20px",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TeamWordsLeft wordsLeft={game.redTeam.wordsLeft ?? 0} team={GameModels.Teams.red} />
        {isInterceptionVariant && (
          <Typography
            sx={{
              marginTop: "8px",
              fontWeight: "bold",
              userSelect: "none",
              color: teamColor(GameModels.Teams.red),
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            Score: {game.redTeam.score}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          userSelect: "none",
          fontWeight: "bold",
          textAlign: "center",
          flex: 1,
          color: teamColor(team),
          fontSize: {
            xs: "16px",
            sm: "28px",
            md: "32px",
          },
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        {text}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TeamWordsLeft wordsLeft={game.blueTeam.wordsLeft ?? 0} team={GameModels.Teams.blue} />
        {isInterceptionVariant && (
          <Typography
            sx={{
              marginTop: "8px",
              fontWeight: "bold",
              userSelect: "none",
              color: teamColor(GameModels.Teams.blue),
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            Score: {game.blueTeam.score}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
