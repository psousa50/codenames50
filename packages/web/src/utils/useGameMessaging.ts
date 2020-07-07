import { GameModels, gamePorts } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import React from "react"
import { useGameState } from "./useGameState"
import { useSocketMessaging } from "./useSocketMessaging"

type GameMessagingHandlers = {
  onConnect?: () => void
  onGameCreated?: (game: GameModels.CodeNamesGame) => void
  onHintSent?: (game: GameModels.CodeNamesGame) => void
  onRevealWord?: (game: GameModels.CodeNamesGame) => void
}

export const useGameMessaging = (handlers: GameMessagingHandlers = {}) => {
  const [emitMessage, addMessageHandler] = useSocketMessaging(process.env.REACT_APP_SERVER_URL || "")
  const [game, setGame] = useGameState()

  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const setupMessageHandlers = () => {
      addMessageHandler(Messages.createGameMessagehandler("connect", onConnect))
      addMessageHandler(Messages.createGameMessagehandler("gameCreated", onGameCreated))
      addMessageHandler(Messages.createGameMessagehandler("gameError", onError))
      addMessageHandler(Messages.createGameMessagehandler("gameStarted", onGameStarted))
      addMessageHandler(Messages.createGameMessagehandler("hintSent", onHintSent))
      addMessageHandler(Messages.createGameMessagehandler("joinedGame", onJoinedGame))
      addMessageHandler(Messages.createGameMessagehandler("joinTeam", onJoinTeam))
      addMessageHandler(Messages.createGameMessagehandler("removePlayer", onRemovePlayer))
      addMessageHandler(Messages.createGameMessagehandler("restartGame", onRestartGame))
      addMessageHandler(Messages.createGameMessagehandler("setSpyMaster", onSetSpyMaster))
      addMessageHandler(Messages.createGameMessagehandler("turnChanged", onTurnChanged))
      addMessageHandler(Messages.createGameMessagehandler("updateConfig", onUpdateConfig))
      addMessageHandler(Messages.createGameMessagehandler("updateGame", onUpdateGame))
      addMessageHandler(Messages.createGameMessagehandler("wordRevealed", onWordRevealed))
    }

    const onConnect = () => {
      handlers.onConnect && handlers.onConnect()
    }

    const onGameCreated = (game: GameModels.CodeNamesGame) => {
      setGame(game)
      handlers.onGameCreated && handlers.onGameCreated(game)
    }

    const onJoinedGame = (input: Messages.JoinedGameInput) => {
      setGame(input.game)
    }

    const onRemovePlayer = ({ userId }: Messages.RemovePlayerInput) => {
      setGame(gamePorts.removePlayer(userId))
    }

    const onSetSpyMaster = ({ userId, team }: Messages.SetSpyMasterInput) => {
      setGame(gamePorts.setSpyMaster(userId, team))
    }

    const onJoinTeam = ({ userId, team }: Messages.JoinTeamInput) => {
      setGame(gamePorts.joinTeam(userId, team))
    }

    const onGameStarted = (game: GameModels.CodeNamesGame) => {
      setGame(game)
    }

    const onRestartGame = () => {
      setGame(gamePorts.restartGame)
    }

    const onUpdateGame = (game: GameModels.CodeNamesGame) => {
      setGame(game)
    }

    const onUpdateConfig = (input: Messages.UpdateConfigInput) => {
      setGame(g => ({ ...g, config: input.config }))
    }

    const onHintSent = (input: Messages.HintSentInput) => {
      const { userId, hintWord, hintWordCount } = input
      setGame(gamePorts.sendHint(userId, hintWord, hintWordCount), handlers.onHintSent)
    }

    const onWordRevealed = ({ userId, row, col, now }: Messages.WordRevealedInput) => {
      setGame(gamePorts.revealWord(userId, row, col, now), handlers.onRevealWord)
    }

    const onTurnChanged = ({ userId, now }: Messages.TurnChangedInput) => {
      setGame(gamePorts.forceChangeTurn(userId, now))
    }

    const onError = (e: { message: string }) => {
      setError(e.message)
    }

    setupMessageHandlers()
  }, [addMessageHandler, handlers, setGame])

  return {
    emitMessage,
    error,
    game,
    setError,
  }
}
