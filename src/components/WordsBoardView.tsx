import { common, grey } from "@material-ui/core/colors"
import { makeStyles, Theme } from "@material-ui/core/styles"
import * as R from "ramda"
import React from "react"
import { animated as a, useSpring } from "react-spring"
import { BoardWord, CodeNamesGame, WordsBoard, WordType } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { blueColor, redColor } from "../utils/styles"

export type OnWordClick = (word: BoardWord, row: number, col: number) => void

const wordColors = {
  [WordType.red]: redColor,
  [WordType.blue]: blueColor,
  [WordType.inocent]: grey[400],
  [WordType.assassin]: grey[700],
}

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    width: "100vw",
    tableLayout: "fixed",
    padding: "10px",
  },
  cell: {
    position: "relative",
    display: "flex",
    flexGrow: 1,
    padding: "2rem 0.1rem 2rem 0.1rem",
  },
  word: {
    display: "flex",
    flex: 1,
    textAlign: "center",
    justifyContent: "center",
    [theme.breakpoints.down(400)]: {
      fontSize: "6px",
    },
    [theme.breakpoints.between(400, 600)]: {
      fontSize: "8px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "10px",
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
  onWordClick: OnWordClick
}

const WordView: React.FC<WordViewProps> = ({ userId, game, word, revealWords, onWordClick, row, col }) => {
  const classes = useStyles()

  const canReveal = GameRules.revealWord(row, col, userId)(game) === undefined

  const styles = {
    normal: {
      backgroundColor: grey[200],
      cursor: canReveal ? "pointer" : undefined,
      position: "absolute" as "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      flex: 1,
      alignItems: "center",
      border: "2px solid white",
      borderRadius: "5px",
      boxShadow: "inset 0 0 10px #000000",
    },
    revealed: {
      backgroundColor: wordColors[word.type],
      color: word.type === WordType.inocent ? common.black : common.white,
      fontWeight: "bold" as "bold",
    },
  }

  const rw = revealWords || word.revealed

  const { transform, opacity } = useSpring({
    opacity: rw ? 1 : 0,
    transform: `perspective(600px) rotateX(${rw ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  })

  return (
    <div className={classes.cell} onClick={() => onWordClick(word, row, col)}>
      <a.div
        style={{
          opacity: opacity.interpolate(o => 1 - (typeof o === "number" ? o : Number.parseInt(o || "0"))),
          transform,
          ...styles.normal,
        }}
        className={classes.word}
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
        className={classes.word}
      >
        {word.word.toUpperCase()}
      </a.div>
    </div>
  )
}
