import { Snackbar, Dialog, DialogContent, IconButton, Box, Alert, AlertTitle } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import React from "react"
import { GameModels } from "@codenames50/core"
import { EmitMessage } from "../../../utils/types"
import { RunningGame } from "./RunningGame"
import { SetupGame } from "./SetupGame"
import { Header } from "./Header"
import { backgroundColor } from "../../../utils/styles"

export interface PlayGameProps {
  game: GameModels.CodeNamesGame
  userId: string
  emitMessage: EmitMessage
  error: string
  clearError: () => void
}

export const PlayGame: React.FC<PlayGameProps> = ({ game, userId, emitMessage, error, clearError }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // Close modal when game state changes
  React.useEffect(() => {
    setDialogOpen(false)
  }, [game.state])

  const gameState = () => {
    switch (game.state) {
      case GameModels.GameStates.idle:
        return <SetupGame emitMessage={emitMessage} game={game} userId={userId} />
      case GameModels.GameStates.running:
        return (
          <RunningGame emitMessage={emitMessage} game={game} userId={userId} onSetupClick={() => setDialogOpen(true)} />
        )
      case GameModels.GameStates.ended:
        return (
          <RunningGame game={game} userId={userId} emitMessage={emitMessage} onSetupClick={() => setDialogOpen(true)} />
        )
      default:
        return <div>Unknown game state</div>
    }
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px" }}>
      <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={() => clearError()}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ marginTop: "10px" }}>
        <Header
          game={game}
          userId={userId}
          onSetupClick={game.state !== GameModels.GameStates.idle ? () => setDialogOpen(true) : undefined}
        />
      </Box>

      {gameState()}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: `${backgroundColor} !important`,
            backgroundImage: "none",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            backgroundColor: backgroundColor,
          }}
        >
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "grey.500",
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent
            sx={{
              backgroundColor: `${backgroundColor} !important`,
              backgroundImage: "none",
            }}
          >
            <SetupGame emitMessage={emitMessage} game={game} userId={userId} isDialog={true} />
          </DialogContent>
        </Box>
      </Dialog>
    </Box>
  )
}
