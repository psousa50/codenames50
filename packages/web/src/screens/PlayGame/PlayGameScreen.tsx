import { Messages } from "@codenames50/messaging"
import { CircularProgress, makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { usePlayGameMessaging } from "../../utils/usePlayGameMessaging"
import { PlayGame } from "./components/PlayGame"

const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    marginTop: "10rem",
  },
}))

interface PlayGameScreenProps {
  gameId: string
  userId: string
}

export const PlayGameScreen: React.FC<PlayGameScreenProps> = ({ gameId, userId }) => {
  const classes = useStyles()

  const { emitMessage, game, error, clearError } = usePlayGameMessaging(userId)

  React.useEffect(() => {
    emitMessage(Messages.registerUserSocket({ userId }))
    emitMessage(Messages.joinGame({ gameId, userId }))
  }, [emitMessage, gameId, userId])

  return game ? (
    <PlayGame emitMessage={emitMessage} game={game} userId={userId} error={error} clearError={clearError} />
  ) : (
    <div className={classes.progress}>
      <CircularProgress />
    </div>
  )
}
