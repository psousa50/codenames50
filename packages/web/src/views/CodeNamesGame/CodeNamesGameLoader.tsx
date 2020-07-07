import { CircularProgress, makeStyles, Theme } from "@material-ui/core"
import { Messages } from "@codenames50/messaging"
import React from "react"
import { useGameMessaging } from "../../utils/useGameMessaging"
import { CodeNamesGameView } from "./CodeNamesGameView"
import { GameModels } from "@codenames50/core"
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

  const onConnect = () => {
    emitMessage(Messages.registerUserSocket({ userId }))
    emitMessage(Messages.joinGame({ gameId, userId }))
  }

  const onHintSent = (game: GameModels.CodeNamesGame) => {
    const teamConfig = game.turn === GameModels.Teams.red ? game.redTeam : game.blueTeam
    if (teamConfig.spyMaster !== userId) {
      playHintAlertSound()
    }
  }

  const onRevealWord = (game: GameModels.CodeNamesGame) => {
    if (game.turnOutcome === "success") {
      playSuccessSound()
    }
    if (game.turnOutcome === "failure") {
      playFailureSound()
    }
    if (game.state === GameModels.GameStates.ended) {
      if (game.turnOutcome === "assassin") {
        playAssassinSound()
      } else playEndGameSound()
    }
  }

  const { emitMessage, error, game, setError } = useGameMessaging({ onConnect, onHintSent, onRevealWord })

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
