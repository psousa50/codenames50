import { Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles, Typography } from "@material-ui/core"
import copy from "copy-to-clipboard"
import React from "react"

const useStyles = makeStyles(theme => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}))

interface InvitePlayersDialogProps {
  gameId: string
  open: boolean
  onClose: () => void
}

export const InvitePlayersDialog: React.FC<InvitePlayersDialogProps> = ({ gameId, open, onClose }) => {
  const classes = useStyles()

  React.useEffect(() => {
    if (open) {
      const url = `${window.location.origin}/join?gameId=${gameId}`
      copy(url)
    }
  }, [gameId, open])

  return (
    <Dialog aria-labelledby="simple-dialog-title" onClose={onClose} open={open}>
      <DialogTitle>
        <div>
          <Typography variant="h6">Invite Players</Typography>
        </div>
      </DialogTitle>
      <DialogContent dividers className={classes.content}>
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
