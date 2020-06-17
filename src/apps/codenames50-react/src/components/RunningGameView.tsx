import { makeStyles, Theme } from "@material-ui/core"
import { CodeNamesGame } from "codenames50-core/lib/models"
import * as GameRules from "codenames50-core/lib/rules"
import React from "react"
import * as Messages from "codenames50-messaging/lib/messages"
import { Hint } from "../utils/types"
import { teamName } from "../utils/ui"
import { EmitMessage } from "./CodeNamesGameView"
import { HintView } from "./HintView"
import { SendHintView } from "./SendHintView"
import { OnWordClick, WordsBoardView } from "./WordsBoardView"
import { WordsLeftView } from "./WordsLeftView"

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

interface RunningGameViewProps {
  game: CodeNamesGame
  userId: string
  emitMessage: EmitMessage
}

export const RunningGameView: React.FC<RunningGameViewProps> = ({ game, userId, emitMessage }) => {
  const classes = useStyles()

  const gameId = game.gameId
  const [hint, setHint] = React.useState<Hint>({ word: "", count: 0, startedTime: 0 })

  const endTurn = () => {
    emitMessage(Messages.changeTurn({ gameId, userId }))
  }

  const onTimeout = () => {
    emitMessage(Messages.turnTimeout({ gameId, userId }))
  }

  const sendHint = () => {
    setHint({ word: "", count: 0, startedTime: 0 })
    hint.count && emitMessage(Messages.sendHint({ gameId, userId, hintWord: hint.word, hintWordCount: hint.count }))
  }

  const onWordClick: OnWordClick = (_, row, col) => {
    emitMessage(Messages.revealWord({ gameId, userId, row, col }))
  }

  const canEndTurn = GameRules.changeTurn(userId)(game) === undefined

  const hintToView = { word: game.hintWord, count: game.hintWordCount, startedTime: game.hintWordStartedTime }

  return (
    <div className={classes.container}>
      <WordsLeftView game={game} text={`${teamName(game.turn)}'s turn`} team={game.turn} />
      <div style={{ marginTop: 20 }}></div>
      <WordsBoardView userId={userId} game={game} board={game.board} onWordClick={onWordClick} revealWords={false} />
      <div style={{ marginTop: 20 }}></div>
      <div className={classes.hint}>
        {(userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster) &&
        game.turn === getPlayer(game, userId)?.team &&
        game.hintWordCount === 0 ? (
          <SendHintView team={game.turn} hint={hint} onChange={setHint} sendHint={sendHint} />
        ) : (
          <HintView
            team={game.turn}
            hint={hintToView}
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
