import { CircularProgress, makeStyles, Theme } from "@material-ui/core"
import * as Messages from "codenames50-messaging/lib/messages"
import React from "react"
import { useGameMessaging } from "../../utils/useGameMessaging"
import { CodeNamesGameView } from "./CodeNamesGameView"
import { CodeNamesGame, Teams, GameStates } from "codenames50-core/lib/models"
import { usePlaySound, sounds } from "../../utils/usePlaySounds"

const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    marginTop: "10rem",
  },
}))

interface CodeNamesGameLoaderProps {
  gameId: string
  userId: string
}

export const CodeNamesGameLoader: React.FC<CodeNamesGameLoaderProps> = ({ gameId, userId }) => {
  const classes = useStyles()

  const [playHintAlertSound] = usePlaySound(sounds.hintAlert)
  const [playSuccessSound] = usePlaySound(sounds.success)
  const [playFailureSound] = usePlaySound(sounds.failure)
  const [playAssassinSound] = usePlaySound(sounds.assassin)
  const [playEndGameSound] = usePlaySound(sounds.endGame)

  const onHintSent = (game: CodeNamesGame) => {
    const teamConfig = game.turn === Teams.red ? game.redTeam : game.blueTeam
    if (teamConfig.spyMaster !== userId) {
      playHintAlertSound()
    }
  }

  const onRevealWord = (game: CodeNamesGame) => {
    if (game.turnOutcome === "success") {
      playSuccessSound()
    }
    if (game.turnOutcome === "failure") {
      playFailureSound()
    }
    if (game.state === GameStates.ended) {
      if (game.turnOutcome === "assassin") {
        playAssassinSound()
      } else playEndGameSound()
    }
  }

  const { emitMessage, error, game, setError } = useGameMessaging(onConnect, { onHintSent, onRevealWord })

  function onConnect() {
    emitMessage(Messages.registerUserSocket({ userId }))
    emitMessage(Messages.joinGame({ gameId, userId }))
  }

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
