import { common } from "@material-ui/core/colors"
import { makeStyles, Theme } from "@material-ui/core/styles"
import * as R from "ramda"
import React from "react"
import { animated as a, useSpring } from "react-spring"
import { BoardWord, CodeNamesGame, WordsBoard, WordType } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { backgroundColor, blueColor, inocentColor, redColor } from "../utils/styles"

export type OnWordClick = (word: BoardWord, row: number, col: number) => void

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    width: "85vw",
    tableLayout: "fixed",
  },
  cellWrapper: {
    position: "relative",
    display: "flex",
    flexGrow: 1,
    padding: "2rem 0.0rem 2rem 0.0rem",
    border: `6px solid ${backgroundColor}`,
  },
  cell: {
    position: "absolute",
    display: "flex",
    flex: 1,
    top: -3,
    left: -3,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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

  const rw = revealWords || word.revealed

  const styles = {
    base: {
      cursor: canReveal ? "pointer" : undefined,
    },
    unrevelead: {
      backgroundColor: common.white,
      border: `4px solid ${common.white}`,
      color: common.black,
    },
    unrevelead_spyMaster: {
      [WordType.red]: {
        color: common.white,
        border: `4px solid ${redColor}`,
      },
      [WordType.blue]: {
        color: common.white,
        border: `4px solid ${blueColor}`,
      },
      [WordType.inocent]: {
        backgroundColor: common.white,
        border: `4px solid ${common.white}`,
        color: common.black,
      },
      [WordType.assassin]: {
        backgroundColor: common.black,
        border: `4px solid ${common.white}`,
        color: common.white,
      },
    },
    revealed: {
      [WordType.red]: {
        backgroundColor: redColor,
        border: `4px solid ${redColor}`,
        color: common.black,
      },
      [WordType.blue]: {
        backgroundColor: blueColor,
        border: `4px solid ${blueColor}`,
        color: common.white,
      },
      [WordType.inocent]: {
        backgroundColor: inocentColor,
        border: `4px solid ${inocentColor}`,
        color: common.black,
      },
      [WordType.assassin]: {
        backgroundColor: common.black,
        border: `4px solid ${common.black}`,
        color: common.white,
      },
    },
  }

  const unrevealedStyles = forSpyMaster ? styles.unrevelead_spyMaster[word.type] : styles.unrevelead

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
          ...styles.base,
          ...unrevealedStyles,
        }}
        className={classes.cell}
      >
        {word.word.toUpperCase()}
      </a.div>
      <a.div
        style={{
          opacity,
          transform: transform.interpolate(t => `${t} rotateX(180deg)`),
          ...styles.base,
          ...styles.revealed[word.type],
        }}
        className={classes.cell}
      >
        {word.word.toUpperCase()}
      </a.div>
    </div>
  )
}
