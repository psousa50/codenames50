import { makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import * as Messages from "../messaging/messages"
import { teamName } from "../utils/ui"
import { EmitMessage } from "./CodeNamesGameView"
import { HintView } from "./HintView"
import { Hint } from "./types"
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
  const [hint, setHint] = React.useState<Hint>({ word: "" })

  const endTurn = () => {
    emitMessage(Messages.changeTurn({ gameId, userId }))
  }

  const sendHint = () => {
    setHint({ word: "" })
    hint.count && emitMessage(Messages.sendHint({ gameId, userId, hintWord: hint.word, hintWordCount: hint.count }))
  }
  const onWordClick: OnWordClick = (_, row, col) => {
    emitMessage(Messages.revealWord({ gameId, userId, row, col }))
  }

  const canEndTurn = GameRules.changeTurn(userId)(game) === undefined

  return (
    <div className={classes.container}>
      <WordsLeftView game={game} text={`${teamName(game.turn)}'s turn`} team={game.turn} />
      <div style={{ marginTop: 20 }}></div>
      <WordsBoardView userId={userId} game={game} board={game.board} onWordClick={onWordClick} revealWords={false} />
      <div className={classes.hint}>
        {(userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster) &&
        game.turn === getPlayer(game, userId)?.team &&
        game.hintWordCount === 0 ? (
          <HintView team={game.turn} hint={hint} canEndTurn={canEndTurn} onChange={setHint} sendHint={sendHint} />
        ) : (
          <HintView
            team={game.turn}
            hint={{ word: game.hintWord, count: game.hintWordCount }}
            canEndTurn={canEndTurn}
            endTurn={endTurn}
          />
        )}
      </div>
    </div>
  )
}
