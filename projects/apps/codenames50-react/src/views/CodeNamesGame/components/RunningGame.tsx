import { makeStyles, Theme } from "@material-ui/core"
import { CodeNamesGame } from "codenames50-core/lib/models"
import * as GameRules from "codenames50-core/lib/rules"
import * as Messages from "codenames50-messaging/lib/messages"
import React from "react"
import { EmitMessage, Hint as HintModel } from "../../../utils/types"
import { teamName } from "../../../utils/ui"
import { Hint } from "./Hint"
import { SendHint } from "./SendHint"
import { OnWordClick, WordsBoard } from "./WordsBoard"
import { WordsLeft } from "./WordsLeft"

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  hint: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "row",
  },
}))

interface RunningGameProps {
  emitMessage: EmitMessage
  game: CodeNamesGame
  userId: string
}

export const RunningGame: React.FC<RunningGameProps> = ({ game, userId, emitMessage }) => {
  const classes = useStyles()

  const gameId = game.gameId
  const [hint, setHint] = React.useState<HintModel>({ word: "", count: 0, startedTime: 0 })

  const endTurn = () => {
    emitMessage(Messages.changeTurn({ gameId, userId }))
  }

  const onTimeout = () => {
    emitMessage(Messages.checkTurnTimeout({ gameId, userId }))
  }

  const sendHint = () => {
    setHint({ word: "", count: 0, startedTime: 0 })
    emitMessage(Messages.sendHint({ gameId, userId, hintWord: hint.word, hintWordCount: hint.count }))
  }

  const onWordClick: OnWordClick = (_, row, col) => {
    emitMessage(Messages.revealWord({ gameId, userId, row, col }))
  }

  const playersTeamIsPlaying = () => getPlayer(game, userId)?.team === game.turn
  const playerIsSpyMaster = () => game.redTeam.spyMaster === userId || game.blueTeam.spyMaster === userId
  const thereIsAHint = () => game.hintWordCount > 0

  const turnMessageForPlayerTurn = () =>
    playerIsSpyMaster() && thereIsAHint()
      ? "Waiting for your Agents..."
      : playerIsSpyMaster() && !thereIsAHint()
      ? "Your turn, choose a hint..."
      : !playerIsSpyMaster() && thereIsAHint()
      ? "Select your words"
      : "Waiting for Spy Masters' hint..."

  const buildTurnsMessage = () =>
    playersTeamIsPlaying() ? turnMessageForPlayerTurn() : `${teamName(game.turn)}'s turn`

  const canEndTurn = GameRules.changeTurn(userId)(game) === undefined

  const hintToView = { word: game.hintWord, count: game.hintWordCount, startedTime: game.turnStartedTime }

  return (
    <div className={classes.container}>
      <WordsLeft game={game} text={buildTurnsMessage()} team={game.turn} />
      <div style={{ marginTop: 20 }}></div>
      <WordsBoard userId={userId} game={game} board={game.board} onWordClick={onWordClick} revealWords={false} />
      <div style={{ marginTop: 20 }}></div>
      <div className={classes.hint}>
        {(userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster) &&
        game.turn === getPlayer(game, userId)?.team &&
        game.hintWordCount === 0 ? (
          <SendHint
            team={game.turn}
            hint={hint}
            responseTimeoutSec={game.config.responseTimeoutSec}
            onChange={setHint}
            sendHint={sendHint}
            onTimeout={onTimeout}
          />
        ) : (
          <Hint
            team={game.turn}
            hint={hintToView}
            wordsRevealedCount={game.wordsRevealedCount}
            responseTimeoutSec={game.config.responseTimeoutSec}
            canEndTurn={canEndTurn}
            endTurn={endTurn}
            onTimeout={onTimeout}
          />
        )}
      </div>
    </div>
  )
}
