import { common } from "@material-ui/core/colors"
import { makeStyles, Theme } from "@material-ui/core/styles"
import * as R from "ramda"
import React from "react"
import { animated as a, useSpring } from "react-spring"
import { BoardWord, CodeNamesGame, WordsBoard, WordType } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { blueColor, inocentColor, redColor } from "../utils/styles"

export type OnWordClick = (word: BoardWord, row: number, col: number) => void

const calcWidth = "calc(100vw/5 - 20px)"

const useStyles = makeStyles((theme: Theme) => ({
  rows: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  cells: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    padding: "5px",
  },
  cellWrapper: {
    position: "relative",
    display: "flex",
    flex: 1,
    width: calcWidth,
    height: calcWidth,
    maxWidth: "150px",
    maxHeight: "150px",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px",
  },
  cell: {
    position: "absolute",
    width: calcWidth,
    height: calcWidth,
    maxWidth: "150px",
    maxHeight: "150px",
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    userSelect: "none",
    fontFamily: "Teko",
    [theme.breakpoints.down(400)]: {
      fontSize: "14px",
    },
    [theme.breakpoints.between(400, 600)]: {
      fontSize: "18px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "18px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "26px",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "30px",
    },
    [theme.breakpoints.up("xl")]: {
      fontSize: "34px",
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
    <div className={classes.rows}>
      {R.range(0, s).map(row => (
        <div key={row} className={classes.cells}>
          {board[row].map((word, col) => (
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
          ))}
        </div>
      ))}
    </div>
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
      border: `3px solid ${common.white}`,
      color: common.black,
    },
    unrevelead_spyMaster: {
      [WordType.red]: {
        color: common.white,
        border: `3px solid ${redColor}`,
      },
      [WordType.blue]: {
        color: common.white,
        border: `3px solid ${blueColor}`,
      },
      [WordType.inocent]: {
        backgroundColor: common.white,
        border: `3px solid ${common.white}`,
        color: common.black,
      },
      [WordType.assassin]: {
        backgroundColor: common.black,
        border: `3px solid ${common.black}`,
        color: common.white,
      },
    },
    revealed: {
      [WordType.red]: {
        backgroundColor: redColor,
        border: `3px solid ${redColor}`,
        color: common.black,
      },
      [WordType.blue]: {
        backgroundColor: blueColor,
        border: `3px solid ${blueColor}`,
        color: common.white,
      },
      [WordType.inocent]: {
        backgroundColor: inocentColor,
        border: `3px solid ${inocentColor}`,
        color: common.black,
      },
      [WordType.assassin]: {
        backgroundColor: common.black,
        border: `3px solid ${common.black}`,
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
