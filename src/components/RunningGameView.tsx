import { makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, Teams } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import * as Messages from "../messaging/messages"
import { teamColor } from "../utils/styles"
import { EmitMessage } from "./CodeNamesGameView"
import { HintView } from "./HintView"
import { Hint } from "./types"
import { OnWordClick, WordsBoardView } from "./WordsBoardView"
import { WordsLeft } from "./WordsLeftView"

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  wordsLeftContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordsLeft: {
    paddingLeft: theme.spacing(10),
    paddingRight: theme.spacing(10),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
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

  const styles = {
    turn: {
      fontSize: 20,
      fontWeight: "bold" as "bold",
      color: teamColor(game.turn),
    },
  }

  const gameId = game.gameId
  const [hint, setHint] = React.useState<Hint>({ word: "" })

  const endTurn = () => {
    emitMessage(Messages.changeTurn({ gameId, userId }))
  }

  const sendHint = () => {
    hint.count && emitMessage(Messages.sendHint({ gameId, userId, hintWord: hint.word, hintWordCount: hint.count }))
  }
  const onWordClick: OnWordClick = (_, row, col) => {
    emitMessage(Messages.revealWord({ gameId, userId, row, col }))
  }

  const canEndTurn = GameRules.changeTurn(userId)(game) === undefined

  return (
    <div className={classes.container}>
      <div className={classes.wordsLeftContainer}>
        <div className={classes.wordsLeft}>
          <WordsLeft count={game.redTeam.wordsLeft} team={Teams.red} />
        </div>
        <div className={classes.wordsLeft}>
          <WordsLeft count={game.blueTeam.wordsLeft} team={Teams.blue} />
        </div>
      </div>
      <WordsBoardView
        board={game.board}
        onWordClick={onWordClick}
        revealWords={userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster}
      />
      <div style={styles.turn}>{game.turn === Teams.red ? "Red's Turn" : "Blue's turn"}</div>
      <div className={classes.hint}>
        {(userId === game.redTeam.spyMaster || userId === game.blueTeam.spyMaster) &&
        game.turn === getPlayer(game, userId)?.team &&
        game.hintWordCount === 0 ? (
          <HintView hint={hint} canEndTurn={canEndTurn} onChange={setHint} sendHint={sendHint} />
        ) : (
          <HintView
            hint={{ word: game.hintWord, count: game.hintWordCount }}
            canEndTurn={canEndTurn}
            endTurn={endTurn}
          />
        )}
      </div>
    </div>
  )
}
