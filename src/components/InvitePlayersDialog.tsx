import { Button, Dialog, DialogContent, DialogTitle, IconButton, makeStyles, Typography } from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close"
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

  const [copied, setCopied] = React.useState(false)

  const copyGameLink = () => {
    const url = `${window.location.origin}/join?gameId=${gameId}`
    copy(url)
    setCopied(true)
  }

  return (
    <Dialog aria-labelledby="simple-dialog-title" onClose={onClose} open={open}>
      <DialogTitle>
        <Typography variant="h6">Invite Players</Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className={classes.content}>
        <Button
          size="small"
          color="secondary"
          className={classes.submit}
          onClick={() => {
            copyGameLink()
          }}
        >
          Copy game link to invite other players
        </Button>
        {copied && <Typography variant="subtitle2">Game link copied to Clipboard</Typography>}
      </DialogContent>
    </Dialog>
  )
}
