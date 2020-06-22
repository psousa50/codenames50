import * as GameActions from "codenames50-core/lib/main"
import { CodeNamesGame, GameConfig, GameStates, Teams } from "codenames50-core/lib/models"
import React from "react"
import { EmitMessage } from "../views/CodeNamesGameView"
import * as Messages from "codenames50-messaging/lib/messages"
import { sounds, usePlaySound } from "./usePlaySounds"
import { useSocket } from "./useSocket"

export const useMessaging = (gameId: string, userId: string, onStartGame: () => void, onRestartGame: () => void) => {
  const [socket] = useSocket(process.env.REACT_APP_SERVER_URL || "", { autoConnect: false })
  const [game, setGame] = React.useState<CodeNamesGame>(GameActions.createGame("", "", ""))
  const [playSuccessSound] = usePlaySound(sounds.success)
  const [playFailureSound] = usePlaySound(sounds.failure)
  const [playHintAlertSound] = usePlaySound(sounds.hintAlert)
  const [playAssassinSound] = usePlaySound(sounds.assassin)
  const [playEndGameSound] = usePlaySound(sounds.endGame)

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

    addMessageHandler(socket, Messages.createGameMessagehandler("changeTurn", changeTurnHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("connect", connectHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("gameError", errorHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("gameStarted", gameStartedHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("hintSent", hintSentHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("joinedGame", joinedGameHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("joinTeam", joinTeamHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("restartGame", restartGameHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("removePlayer", removePlayerHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("revealWord", revealWordHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("setSpyMaster", setSpyMasterHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("updateGame", updateGameHandler))
    addMessageHandler(socket, Messages.createGameMessagehandler("turnTimeout", turnTimeoutHandler))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connectHandler = () => {
    emitMessage(socket)(Messages.registerUserSocket({ userId }))

    joinGame()
  }

  const joinGame = () => {
    emitMessage(socket)(Messages.joinGame({ gameId, userId }))
  }

  const joinTeam = (team: Teams) => {
    emitMessage(socket)(Messages.joinTeam({ gameId, userId, team }))
  }

  const randomizeTeams = () => {
    emitMessage(socket)(Messages.randomizeTeam({ gameId }))
  }

  const startGame = (config: GameConfig) => {
    emitMessage(socket)(Messages.startGame({ gameId, userId, config }))
  }

  const restartGame = () => {
    emitMessage(socket)(Messages.restartGame({ gameId, userId }))
  }

  const setSpyMaster = (team: Teams) => {
    emitMessage(socket)(Messages.setSpyMaster({ gameId, userId, team }))
  }

  const joinedGameHandler = (input: Messages.JoinedGameInput) => {
    setGame(input.game)
  }

  const removePlayerHandler = ({ userId }: Messages.RemovePlayerInput) => {
    setGame(GameActions.removePlayer(userId))
  }

  const joinTeamHandler = ({ userId, team }: Messages.JoinTeamInput) => {
    setGame(GameActions.joinTeam(userId, team))
  }

  const gameStartedHandler = (game: CodeNamesGame) => {
    setGame(game)
    onStartGame()
  }

  const restartGameHandler = () => {
    setGame(GameActions.restartGame)
    onRestartGame()
  }

  const updateGameHandler = (game: CodeNamesGame) => {
    setGame(game)
  }

  const setSpyMasterHandler = ({ userId, team }: Messages.SetSpyMasterInput) => {
    setGame(GameActions.setSpyMaster(userId, team))
  }

  const hintSentHandler = ({ hintWord, hintWordCount, hintWordStartedTime }: Messages.HintSentInput) => {
    setGame(GameActions.sendHint(hintWord, hintWordCount, hintWordStartedTime))
    const teamConfig = game.turn === Teams.red ? game.redTeam : game.blueTeam
    if (teamConfig.spyMaster !== userId) {
      playHintAlertSound()
    }
  }

  const revealWordHandler = ({ userId, row, col }: Messages.RevealWordInput) => {
    setGame(oldGame => {
      const newGame = GameActions.revealWord(userId, row, col)(oldGame)

      if (newGame.turnOutcome === "success") {
        playSuccessSound()
      }
      if (newGame.turnOutcome === "failure") {
        playFailureSound()
      }
      if (newGame.state === GameStates.ended) {
        if (newGame.turnOutcome === "assassin") {
          playAssassinSound()
        } else playEndGameSound()
      }

      return newGame
    })
  }

  const changeTurnHandler = () => {
    setGame(GameActions.changeTurn())
  }

  const turnTimeoutHandler = () => {
    setGame(GameActions.turnTimeout())
  }

  const errorHandler = (e: { message: string }) => {
    setError(e.message)
  }

  return {
    emitMessage: emitMessage(socket),
    error,
    game,
    joinTeam,
    setError,
    setSpyMaster,
    startGame,
    randomizeTeams,
    restartGame,
  }
}
