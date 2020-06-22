import React from "react"
import { useMessaging } from "../../utils/messaging"
import { CodeNamesGameView } from "./CodeNamesGameView"
import { CircularProgress, makeStyles, Theme } from "@material-ui/core"

interface CodeNamesGameLoaderProps {
  gameId: string
  userId: string
}

export const CodeNamesGameLoader: React.FC<CodeNamesGameLoaderProps> = ({ gameId, userId }) => {
  const classes = useStyles()

  const { emitMessage, error, game, setError } = useMessaging(gameId, userId)

  return game ? (
    <CodeNamesGameView
      emitMessage={emitMessage}
      error={error}
      game={game}
      userId={userId}
      clearError={() => setError("")}
    />
  ) : (
    <div className={classes.progress}>
      <CircularProgress />
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    marginTop: "10rem",
  },
}))
