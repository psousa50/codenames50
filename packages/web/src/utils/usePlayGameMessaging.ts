import { GameModels, gamePorts } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import React from "react"
import { useGameMessaging } from "./useGameMessaging"
import { sounds, usePlaySound } from "./usePlaySound"

export const usePlayGameMessaging = (gameId: string, userId: string) => {
  const playHintAlertSound = usePlaySound(sounds.hintAlert)
  const playSuccessSound = usePlaySound(sounds.success)
  const playFailureSound = usePlaySound(sounds.failure)
  const playAssassinSound = usePlaySound(sounds.assassin)
  const playEndGameSound = usePlaySound(sounds.endGame)
  const playStealSound = usePlaySound(sounds.steal)

  const { connect, emitMessage, addMessageHandler, game, setGame, error, clearError } = useGameMessaging()

  React.useEffect(() => {
    const onConnect = () => {
      emitMessage(Messages.joinGame({ gameId, userId }))
    }

    connect(onConnect)
  }, [connect, emitMessage, gameId, userId])

  React.useEffect(() => {
    const setupMessageHandlers = () => {
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
      addMessageHandler(Messages.createGameMessagehandler("wordIntercepted", onWordIntercepted))
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
      setGame(gamePorts.sendHint(userId, hintWord, hintWordCount), hintSentSound)
    }

    const onWordRevealed = ({ userId, row, col, now }: Messages.WordRevealedInput) => {
      setGame(gamePorts.revealWord(userId, row, col, now), wordRevealedSound)
    }

    const onTurnChanged = ({ userId, now }: Messages.TurnChangedInput) => {
      setGame(gamePorts.forceChangeTurn(userId, now))
    }

    const onWordIntercepted = ({ userId, row, col, now, success }: Messages.WordInterceptedInput) => {
      setGame(gamePorts.revealWord(userId, row, col, now), game => wordInterceptedSound(game, row, col, success))
    }

    const hintSentSound = (game: GameModels.CodeNamesGame) => {
      const teamConfig = game.turn === GameModels.Teams.red ? game.redTeam : game.blueTeam
      if (teamConfig.spyMaster !== userId) {
        playHintAlertSound()
      }
    }

    const wordRevealedSound = (game: GameModels.CodeNamesGame) => {
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

    const wordInterceptedSound = (game: GameModels.CodeNamesGame, row: number, col: number, success: boolean) => {
      const revealedWord = game.board[row][col]

      // Check if the intercepted word was the assassin
      if (revealedWord.type === GameModels.WordType.assassin) {
        playAssassinSound()
      } else if (success) {
        playStealSound()
      } else {
        playFailureSound()
      }
    }

    setupMessageHandlers()
  }, [
    addMessageHandler,
    emitMessage,
    gameId,
    playAssassinSound,
    playEndGameSound,
    playFailureSound,
    playHintAlertSound,
    playStealSound,
    playSuccessSound,
    setGame,
    userId,
  ])

  return {
    emitMessage,
    error,
    clearError,
    game,
  }
}
