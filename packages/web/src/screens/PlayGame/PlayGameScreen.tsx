import { CircularProgress, Box } from "@mui/material"
import React from "react"
import { usePlayGameMessaging } from "../../utils/usePlayGameMessaging"
import { PlayGame } from "./components/PlayGame"

export interface PlayGameScreenProps {
  gameId: string
  userId: string
}

export const PlayGameScreen: React.FC<PlayGameScreenProps> = ({ gameId, userId }) => {
  const { emitMessage, game, error, clearError } = usePlayGameMessaging(gameId, userId)

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {game ? (
        <PlayGame emitMessage={emitMessage} game={game} userId={userId} error={error} clearError={clearError} />
      ) : (
        <CircularProgress />
      )}
    </Box>
  )
}
