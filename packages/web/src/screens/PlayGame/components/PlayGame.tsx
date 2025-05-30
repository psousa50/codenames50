import { Snackbar, Typography, Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core"
import { makeStyles, Theme } from "@material-ui/core/styles"
import CloseIcon from "@material-ui/icons/Close"
import { Alert, AlertTitle } from "@material-ui/lab"
import { GameModels } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import React from "react"
import { EmitMessage } from "../../../utils/types"
import { EndedGame } from "./EndedGame"
import { Header } from "./Header"
import { RunningGame } from "./RunningGame"
import { SetupGame } from "./SetupGame"

export interface PlayGameProps {
  emitMessage: EmitMessage
  error: string
  game: GameModels.CodeNamesGame
  userId: string
  clearError: () => void
  interceptResult?: { success: boolean; message: string }
  clearInterceptResult?: () => void
}

const Separator = () => <div style={{ height: "1rem" }}></div>

export const PlayGame: React.FC<PlayGameProps> = ({
  emitMessage,
  error,
  game,
  userId,
  clearError,
  interceptResult,
  clearInterceptResult,
}) => {
  const classes = useStyles()

  const [setupDialogOpen, setSetupDialogOpen] = React.useState(false)

  const gameId = game.gameId

  const restartGame = () => {
    emitMessage(Messages.restartGame({ gameId, userId }))
  }

  const handleSetupDialogToggle = () => {
    setSetupDialogOpen(!setupDialogOpen)
  }

  // Close setup dialog when game starts
  React.useEffect(() => {
    if (game.state === GameModels.GameStates.running) {
      setSetupDialogOpen(false)
    }
  }, [game.state])

  return (
    <div className={classes.container}>
      <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={clearError}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>

      {interceptResult && clearInterceptResult && (
        <Snackbar open={true} autoHideDuration={3000} onClose={clearInterceptResult}>
          <Alert severity={interceptResult.success ? "success" : "warning"}>
            <AlertTitle>{interceptResult.success ? "Intercept Success!" : "Intercept Failed"}</AlertTitle>
            {interceptResult.message}
          </Alert>
        </Snackbar>
      )}

      <div className={classes.game}>
        <Header
          game={game}
          userId={userId}
          onSetupClick={game.state === GameModels.GameStates.running ? handleSetupDialogToggle : undefined}
        />

        <Separator />

        {game.state === GameModels.GameStates.idle ? (
          <SetupGame emitMessage={emitMessage} game={game} userId={userId} />
        ) : (
          <SetupGameDialog
            open={setupDialogOpen}
            onClose={() => setSetupDialogOpen(false)}
            emitMessage={emitMessage}
            game={game}
            userId={userId}
          />
        )}

        <Separator />

        {game.state === GameModels.GameStates.running && (
          <RunningGame game={game} userId={userId} emitMessage={emitMessage} />
        )}

        {game.state === GameModels.GameStates.ended && <EndedGame userId={userId} game={game} newGame={restartGame} />}
      </div>
    </div>
  )
}

interface SetupGameDialogProps {
  open: boolean
  onClose: () => void
  emitMessage: EmitMessage
  game: GameModels.CodeNamesGame
  userId: string
}

const SetupGameDialog: React.FC<SetupGameDialogProps> = ({ open, onClose, emitMessage, game, userId }) => {
  const classes = useStyles()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className={classes.setupDialog}>
      <IconButton onClick={onClose} className={classes.closeButton}>
        <CloseIcon />
      </IconButton>
      <DialogContent className={classes.dialogContent}>
        <SetupGame emitMessage={emitMessage} game={game} userId={userId} isDialog={true} />
      </DialogContent>
    </Dialog>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  game: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px",
  },
  setupDialog: {
    "& .MuiDialog-paper": {
      maxHeight: "90vh",
      position: "relative",
      marginTop: "4vh",
    },
    "& .MuiDialog-container": {
      alignItems: "flex-start",
      paddingTop: "8vh",
    },
  },
  dialogContent: {
    padding: theme.spacing(3),
    "&:first-child": {
      paddingTop: theme.spacing(3),
    },
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: theme.palette.grey[500],
    zIndex: 1,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))
