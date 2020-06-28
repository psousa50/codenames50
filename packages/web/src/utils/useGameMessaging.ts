import { GameModels, gamePorts } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import React from "react"
import { EmitMessage } from "./types"
import { useGameState } from "./useGameState"
import { useSocket } from "./useSocket"

type GameMessagingHandlers = {
  onConnect?: () => void
  onGameCreated?: (game: GameModels.CodeNamesGame) => void
  onHintSent?: (game: GameModels.CodeNamesGame) => void
  onRevealWord?: (game: GameModels.CodeNamesGame) => void
}

export const useGameMessaging = (handlers: GameMessagingHandlers = {}) => {
  const [socket] = useSocket(process.env.REACT_APP_SERVER_URL || "", { autoConnect: false })
  const [game, setGame] = useGameState()

  const [error, setError] = React.useState("")

  const emitMessage = (socket: SocketIOClient.Socket): EmitMessage => message => {
    setError("")
    socket.emit(message.type, message.data)
  }

  const addMessageHandler = (socket: SocketIOClient.Socket, handler: Messages.GameMessageHandler) => {
    socket.on(handler.type, handler.handler)
  }

  React.useEffect(() => {
    socket.connect()

    addMessageHandler(socket, Messages.createGameMessagehandler("connect", onConnect))

    addMessageHandler(socket, Messages.createGameMessagehandler("gameError", onError))
    addMessageHandler(socket, Messages.createGameMessagehandler("gameCreated", onGameCreated))
    addMessageHandler(socket, Messages.createGameMessagehandler("gameStarted", onGameStarted))
    addMessageHandler(socket, Messages.createGameMessagehandler("hintSent", onHintSent))
    addMessageHandler(socket, Messages.createGameMessagehandler("joinedGame", onJoinedGame))
    addMessageHandler(socket, Messages.createGameMessagehandler("joinTeam", onJoinTeam))
    addMessageHandler(socket, Messages.createGameMessagehandler("removePlayer", onRemovePlayer))
    addMessageHandler(socket, Messages.createGameMessagehandler("restartGame", onRestartGame))
    addMessageHandler(socket, Messages.createGameMessagehandler("wordRevealed", onWordRevealed))
    addMessageHandler(socket, Messages.createGameMessagehandler("setSpyMaster", onSetSpyMaster))
    addMessageHandler(socket, Messages.createGameMessagehandler("turnChanged", onTurnChanged))
    addMessageHandler(socket, Messages.createGameMessagehandler("updateGame", onUpdateGame))
    addMessageHandler(socket, Messages.createGameMessagehandler("updateConfig", onUpdateConfig))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setGame(gamePorts.changeTurn(userId, now))
  }

  const onError = (e: { message: string }) => {
    setError(e.message)
  }

  return {
    emitMessage: emitMessage(socket),
    error,
    game,
    setError,
  }
}
