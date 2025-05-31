import { GameModels, GameRules } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import React from "react"
import { Box } from "@mui/material"
import { EmitMessage, Hint as HintModel } from "../../../utils/types"
import { teamName } from "../../../utils/ui"
import { Hint } from "./Hint"
import { SendHint } from "./SendHint"
import { OnWordClick, WordsBoard } from "./WordsBoard"
import { WordsLeft } from "./WordsLeft"
import { exists } from "../../../utils/misc"
import { TimeLeft } from "./TimeLeft"

const getPlayer = (game: GameModels.CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

interface RunningGameProps {
  emitMessage: EmitMessage
  game: GameModels.CodeNamesGame
  userId: string
  onSetupClick?: () => void
}

export const RunningGame: React.FC<RunningGameProps> = ({ game, userId, emitMessage, onSetupClick }) => {
  const gameId = game.gameId

  const endTurn = () => {
    emitMessage(Messages.changeTurn({ gameId, userId }))
  }

  const sendHint = (hint: HintModel) => {
    emitMessage(Messages.sendHint({ gameId, userId, hintWord: hint.word, hintWordCount: hint.count }))
  }

  const onWordClick: OnWordClick = (word, row, col) => {
    const userTeam = getPlayer(game, userId)?.team

    if (game.interceptPhase && game.interceptingTeam === userTeam) {
      // Type assertion for Messages with intercept functionality
      const extendedMessages = Messages as typeof Messages & {
        interceptWord: (params: { gameId: string; userId: string; row: number; col: number }) => Messages.GameMessage
      }
      emitMessage(extendedMessages.interceptWord({ gameId, userId, row, col }))
    } else {
      emitMessage(Messages.revealWord({ gameId, userId, row, col }))
    }
  }

  const playersTeamIsPlaying = () => getPlayer(game, userId)?.team === game.turn
  const playerIsSpyMaster = () => game.redTeam.spyMaster === userId || game.blueTeam.spyMaster === userId
  const thereIsAHint = () => game.hintWordCount > 0

  const turnMessageForPlayerTurn = () => {
    const userTeam = getPlayer(game, userId)?.team
    const isSpyMaster = playerIsSpyMaster()
    const isInterceptingTeam = game.interceptingTeam === userTeam

    if (game.interceptPhase && isInterceptingTeam && !isSpyMaster) {
      return "Intercept opportunity! Click a word you think matches their hint"
    }
    return isSpyMaster && thereIsAHint()
      ? "Waiting for your Agents..."
      : isSpyMaster && !thereIsAHint()
        ? "Your turn, choose a hint"
        : !isSpyMaster && thereIsAHint()
          ? "Select your words"
          : "Waiting for Spy Masters' hint..."
  }

  const buildTurnsMessage = () => {
    if (game.interceptPhase && game.interceptingTeam === getPlayer(game, userId)?.team && !playerIsSpyMaster()) {
      return turnMessageForPlayerTurn()
    }
    return playersTeamIsPlaying() ? turnMessageForPlayerTurn() : `${teamName(game.turn)}'s turn`
  }

  const canEndTurn = GameRules.changeTurn(userId)(game) === undefined

  const hint = { word: game.hintWord, count: game.hintWordCount }

  // Calculate time left for TimeLeft component
  const getTimeLeft = () => {
    if (game.turnTimeoutSec && game.turnStartedTime) {
      const elapsed = Math.floor((Date.now() - game.turnStartedTime) / 1000)
      return Math.max(0, game.turnTimeoutSec - elapsed)
    }
    return 0
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <WordsLeft game={game} text={buildTurnsMessage()} team={game.turn} />
      {exists(game.turnTimeoutSec) && exists(game.turnStartedTime) ? (
        <TimeLeft timeLeft={getTimeLeft()} />
      ) : (
        <Box sx={{ marginTop: "20px" }} />
      )}
      <WordsBoard userId={userId} game={game} board={game.board} onWordClick={onWordClick} revealWords={false} />
      <Box sx={{ marginTop: "10px" }} />
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "row",
        }}
      >
        {(userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster) &&
        game.turn === getPlayer(game, userId)?.team &&
        game.turnStartedTime &&
        game.hintWordCount === 0 ? (
          <SendHint team={game.turn} sendHint={sendHint} />
        ) : (
          <Hint
            team={game.turn}
            hint={hint}
            wordsRevealedCount={game.wordsRevealedCount}
            canEndTurn={canEndTurn}
            endTurn={endTurn}
          />
        )}
      </Box>
    </Box>
  )
}
