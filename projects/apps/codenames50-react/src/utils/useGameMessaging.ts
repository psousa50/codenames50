import * as GameActions from "codenames50-core/lib/main"
import { CodeNamesGame } from "codenames50-core/lib/models"
import * as Messages from "codenames50-messaging/lib/messages"
import React from "react"
import { EmitMessage } from "./types"
import { useSocket } from "./useSocket"
import { useGameState } from "./useGameState"

type GameMessagingHandlers = {
  onConnect?: () => void
  onGameCreated?: (game: CodeNamesGame) => void
  onHintSent?: (game: CodeNamesGame) => void
  onRevealWord?: (game: CodeNamesGame) => void
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

    addMessageHandler(socket, Messages.createGameMessagehandler("changeTurn", onChangeTurn))
    addMessageHandler(socket, Messages.createGameMessagehandler("gameError", onError))
    addMessageHandler(socket, Messages.createGameMessagehandler("gameCreated", onGameCreated))
    addMessageHandler(socket, Messages.createGameMessagehandler("gameStarted", onGameStarted))
    addMessageHandler(socket, Messages.createGameMessagehandler("hintSent", onHintSent))
    addMessageHandler(socket, Messages.createGameMessagehandler("joinedGame", onJoinedGame))
    addMessageHandler(socket, Messages.createGameMessagehandler("joinTeam", onJoinTeam))
    addMessageHandler(socket, Messages.createGameMessagehandler("removePlayer", onRemovePlayer))
    addMessageHandler(socket, Messages.createGameMessagehandler("restartGame", onRestartGame))
    addMessageHandler(socket, Messages.createGameMessagehandler("revealWord", onRevealWord))
    addMessageHandler(socket, Messages.createGameMessagehandler("setSpyMaster", onSetSpyMaster))
    addMessageHandler(socket, Messages.createGameMessagehandler("turnTimeout", onTurnTimeout))
    addMessageHandler(socket, Messages.createGameMessagehandler("updateGame", onUpdateGame))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onConnect = () => {
    handlers.onConnect && handlers.onConnect()
  }

  const onGameCreated = (game: CodeNamesGame) => {
    handlers.onGameCreated && handlers.onGameCreated(game)
  }

  const onJoinedGame = (input: Messages.JoinedGameInput) => {
    setGame(input.game)
  }

  const onRemovePlayer = ({ userId }: Messages.RemovePlayerInput) => {
    setGame(GameActions.removePlayer(userId))
  }

  const onJoinTeam = ({ userId, team }: Messages.JoinTeamInput) => {
    setGame(GameActions.joinTeam(userId, team))
  }

  const onGameStarted = (game: CodeNamesGame) => {
    setGame(game)
  }

  const onRestartGame = () => {
    setGame(GameActions.restartGame)
  }

  const onUpdateGame = (game: CodeNamesGame) => {
    setGame(game)
  }

  const onSetSpyMaster = ({ userId, team }: Messages.SetSpyMasterInput) => {
    setGame(GameActions.setSpyMaster(userId, team))
  }

  const onHintSent = (input: Messages.HintSentInput) => {
    const { hintWord, hintWordCount, hintWordStartedTime } = input
    setGame(oldGame => {
      const newGame = GameActions.sendHint(hintWord, hintWordCount, hintWordStartedTime)(oldGame)

      handlers.onHintSent && handlers.onHintSent(newGame)

      return newGame
    })
  }

  const onRevealWord = ({ userId, row, col }: Messages.RevealWordInput) => {
    setGame(oldGame => {
      const newGame = GameActions.revealWord(userId, row, col)(oldGame)

      handlers.onRevealWord && handlers.onRevealWord(newGame)

      return newGame
    })
  }

  const onChangeTurn = () => {
    setGame(GameActions.changeTurn())
  }

  const onTurnTimeout = () => {
    setGame(GameActions.turnTimeout())
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
