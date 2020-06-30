import { GameModels, GameRules } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import { makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { EmitMessage, Hint as HintModel } from "../../../utils/types"
import { teamName } from "../../../utils/ui"
import { Hint } from "./Hint"
import { SendHint } from "./SendHint"
import { OnWordClick, WordsBoard } from "./WordsBoard"
import { WordsLeft } from "./WordsLeft"
import { exists } from "../../../utils/misc"
import { TimeLeft } from "./TimeLeft"

const getPlayer = (game: GameModels.CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

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
  game: GameModels.CodeNamesGame
  userId: string
}

export const RunningGame: React.FC<RunningGameProps> = ({ game, userId, emitMessage }) => {
  const classes = useStyles()

  const gameId = game.gameId

  const endTurn = () => {
    emitMessage(Messages.changeTurn({ gameId, userId }))
  }

  const onTimeout = () => {
    emitMessage(Messages.checkTurnTimeout({ gameId, userId }))
  }

  const sendHint = (hint: HintModel) => {
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

  const hint = { word: game.hintWord, count: game.hintWordCount }

  return (
    <div className={classes.container}>
      <WordsLeft game={game} text={buildTurnsMessage()} team={game.turn} />
      {exists(game.turnTimeoutSec) && exists(game.turnStartedTime) ? (
        <TimeLeft started={game.turnStartedTime!} turnTimeoutSec={game.turnTimeoutSec!} onTimeout={onTimeout} />
      ) : (
        <div style={{ marginTop: 20 }}></div>
      )}
      <WordsBoard userId={userId} game={game} board={game.board} onWordClick={onWordClick} revealWords={false} />
      <div className={classes.hint}>
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
      </div>
    </div>
  )
}
