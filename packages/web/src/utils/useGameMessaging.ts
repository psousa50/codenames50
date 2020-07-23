import { Messages } from "@codenames50/messaging"
import React from "react"
import { EnvironmentContext } from "../environment"
import { useGameState } from "./useGameState"

export const useGameMessaging = () => {
  const { socketMessaging } = React.useContext(EnvironmentContext)
  const [game, setGame] = useGameState()

  const [error, setError] = React.useState("")

  const clearError = () => {
    setError("")
  }

  React.useEffect(() => {
    const setupMessageHandlers = () => {
      socketMessaging.addMessageHandler(Messages.createGameMessagehandler("gameError", onError))
    }

    const onError = (e: { message: string }) => {
      setError(e.message)
    }

    setupMessageHandlers()
  }, [socketMessaging])

  return {
    ...socketMessaging,
    error,
    clearError,
    game,
    setGame,
  }
}
