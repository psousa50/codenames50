import React from "react"
import * as GameActions from "../codenames-core/main"
import { CodeNamesGame, GameStates, Teams } from "../codenames-core/models"
import { EmitMessage } from "../components/CodeNamesGameView"
import * as Messages from "../messaging/messages"
import { sounds, usePlaySound } from "./usePlaySounds"
import { useSocket } from "./useSocket"

export const useMessaging = (gameId: string, userId: string, onStartGame: () => void, onNextGame: () => void) => {
  const [socket] = useSocket(process.env.REACT_APP_SERVER_URL || "", { autoConnect: false })
  const [game, setGame] = React.useState<CodeNamesGame>(
    GameActions.createGame("", "", "", "", GameActions.buildBoard(5, 5, [])),
  )
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

  const addMessageHandler = <T extends {}>(
    socket: SocketIOClient.Socket,
    type: Messages.GameMessageType,
    handler: (data: T) => void,
  ) => {
    socket.on(type, handler)
  }

  React.useEffect(() => {
    socket.connect()

    addMessageHandler(socket, "changeTurn", endTurnHandler)
    addMessageHandler(socket, "connect", connectHandler)
    addMessageHandler(socket, "gameError", errorHandler)
    addMessageHandler(socket, "hintSent", hintSentHandler)
    addMessageHandler(socket, "joinedGame", joinedGameHandler)
    addMessageHandler(socket, "joinTeam", joinTeamHandler)
    addMessageHandler(socket, "nextGame", nextGameHandler)
    addMessageHandler(socket, "removePlayer", removePlayerHandler)
    addMessageHandler(socket, "revealWord", revealWordHandler)
    addMessageHandler(socket, "setSpyMaster", setSpyMasterHandler)
    addMessageHandler(socket, "startGame", startGameHandler)
    addMessageHandler(socket, "updateGame", updateGameHandler)

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

  const startGame = () => {
    emitMessage(socket)(Messages.startGame({ gameId, userId }))
  }

  const nextGame = () => {
    emitMessage(socket)(Messages.nextGame({ gameId }))
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

  const nextGameHandler = (game: CodeNamesGame) => {
    setGame(game)
    onNextGame()
  }

  const startGameHandler = () => {
    setGame(GameActions.startGame)
    onStartGame()
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

  const endTurnHandler = () => {
    setGame(GameActions.changeTurn)
  }

  const errorHandler = (e: { message: string }) => {
    setError(e.message)
  }

  return {
    emitMessage: emitMessage(socket),
    error,
    game,
    joinTeam,
    nextGame,
    setError,
    setSpyMaster,
    startGame,
    randomizeTeams,
  }
}
