import { Messages } from "@codenames50/messaging"
import React, { useContext } from "react"
import { EnvironmentContext } from "../environment"
import { useGameState } from "./useGameState"

export const useGameMessaging = () => {
  const {
    socketMessaging: { emitMessage, addMessageHandler },
  } = useContext(EnvironmentContext)
  const [game, setGame] = useGameState()

  const [error, setError] = React.useState("")

  const clearError = () => {
    setError("")
  }
  React.useEffect(() => {
    const setupMessageHandlers = () => {
      addMessageHandler(Messages.createGameMessagehandler("gameError", onError))
    }

    const onError = (e: { message: string }) => {
      setError(e.message)
    }

    setupMessageHandlers()
  }, [addMessageHandler])

  return {
    emitMessage,
    addMessageHandler,
    error,
    clearError,
    game,
    setGame,
  }
}
