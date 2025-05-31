import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box } from "@mui/material"
import copy from "copy-to-clipboard"
import React from "react"

interface InvitePlayersDialogProps {
  gameId: string
  open: boolean
  onClose: () => void
}

export const InvitePlayersDialog: React.FC<InvitePlayersDialogProps> = ({ gameId, open, onClose }) => {
  React.useEffect(() => {
    if (open) {
      const url = `${window.location.origin}/join?gameId=${gameId}`
      copy(url)
    }
  }, [gameId, open])

  return (
    <Dialog aria-labelledby="simple-dialog-title" onClose={onClose} open={open}>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Invite Players</Typography>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2">Game link has been copied to Clipboard</Typography>
      </DialogContent>
      <DialogActions>
        <Button color="primary" autoFocus onClick={() => onClose()}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  )
}
