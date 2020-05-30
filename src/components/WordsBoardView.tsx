import { common, grey } from "@material-ui/core/colors"
import { makeStyles, Theme } from "@material-ui/core/styles"
import * as R from "ramda"
import React from "react"
import { animated as a, useSpring } from "react-spring"
import { BoardWord, CodeNamesGame, WordsBoard, WordType } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { blueColor, dimmedBlueColor, dimmedRedColor, redColor } from "../utils/styles"

export type OnWordClick = (word: BoardWord, row: number, col: number) => void

const wordColors = {
  [WordType.red]: redColor,
  [WordType.blue]: blueColor,
  [WordType.inocent]: "#f0f4c3",
  [WordType.assassin]: common.black,
}

const dimmedWordColors = {
  [WordType.red]: dimmedRedColor,
  [WordType.blue]: dimmedBlueColor,
  [WordType.inocent]: grey[200],
  [WordType.assassin]: common.black,
}

const wordTextColors = {
  [WordType.red]: common.white,
  [WordType.blue]: common.white,
  [WordType.inocent]: common.black,
  [WordType.assassin]: common.white,
}

const dimmedWordTextColors = {
  [WordType.red]: redColor,
  [WordType.blue]: blueColor,
  [WordType.inocent]: common.black,
  [WordType.assassin]: common.white,
}

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    width: "100vw",
    tableLayout: "fixed",
    padding: "10px",
  },
  cellWrapper: {
    position: "relative",
    display: "flex",
    flexGrow: 1,
    padding: "2rem 0.0rem 2rem 0.0rem",
  },
  cell: {
    position: "absolute",
    display: "flex",
    flex: 1,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: grey[200],
    alignItems: "center",
    justifyContent: "center",
    border: `0.1rem solid #37474f`,
    borderRadius: "3px",
    textAlign: "center",
    userSelect: "none",
    [theme.breakpoints.down(400)]: {
      fontSize: "8px",
    },
    [theme.breakpoints.between(400, 600)]: {
      fontSize: "10px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "12px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "14px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: "20px",
    },
  },
}))

interface WordsBoardViewProps {
  userId: string
  game: CodeNamesGame
  board: WordsBoard
  revealWords: boolean
  onWordClick?: OnWordClick
}

export const WordsBoardView: React.FC<WordsBoardViewProps> = ({ userId, game, board, onWordClick, revealWords }) => {
  const classes = useStyles()
  const s = 5

  const forSpyMaster = game.redTeam.spyMaster === userId || game.blueTeam.spyMaster === userId

  return (
    <table className={classes.table}>
      <tbody>
        {R.range(0, s).map(row => (
          <tr key={row}>
            {board[row].map((word, col) => (
              <td key={col}>
                <WordView
                  userId={userId}
                  game={game}
                  word={word}
                  revealWords={revealWords}
                  forSpyMaster={forSpyMaster}
                  onWordClick={onWordClick || (() => {})}
                  row={row}
                  col={col}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface WordViewProps {
  userId: string
  game: CodeNamesGame
  word: BoardWord
  row: number
  col: number
  revealWords: boolean
  forSpyMaster: boolean
  onWordClick: OnWordClick
}

const WordView: React.FC<WordViewProps> = ({
  userId,
  game,
  word,
  revealWords,
  forSpyMaster,
  onWordClick,
  row,
  col,
}) => {
  const classes = useStyles()

  const canReveal = GameRules.revealWord(row, col, userId)(game) === undefined

  const styles = {
    normal: {
      cursor: canReveal ? "pointer" : undefined,
    },
    revealed: {
      backgroundColor: forSpyMaster && !word.revealed ? dimmedWordColors[word.type] : wordColors[word.type],
      color: forSpyMaster && !word.revealed ? dimmedWordTextColors[word.type] : wordTextColors[word.type],
    },
  }

  const rw = revealWords || forSpyMaster || word.revealed

  const { transform, opacity } = useSpring({
    opacity: rw ? 1 : 0,
    transform: `perspective(600px) rotateX(${rw ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  })

  return (
    <div className={classes.cellWrapper} onClick={() => onWordClick(word, row, col)}>
      <a.div
        style={{
          opacity: opacity.interpolate(o => 1 - (typeof o === "number" ? o : Number.parseInt(o || "0"))),
          transform,
          ...styles.normal,
        }}
        className={classes.cell}
      >
        {word.word.toUpperCase()}
      </a.div>
      <a.div
        style={{
          opacity,
          transform: transform.interpolate(t => `${t} rotateX(180deg)`),
          ...styles.normal,
          ...styles.revealed,
        }}
        className={classes.cell}
      >
        {word.word.toUpperCase()}
      </a.div>
    </div>
  )
}
