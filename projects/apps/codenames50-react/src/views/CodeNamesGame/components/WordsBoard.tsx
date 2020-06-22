import { common } from "@material-ui/core/colors"
import { makeStyles, Theme } from "@material-ui/core/styles"
import * as Models from "codenames50-core/lib/models"
import * as GameRules from "codenames50-core/lib/rules"
import * as R from "ramda"
import React from "react"
import { animated as a, useSpring } from "react-spring"
import { blueColor, calculatedHeight, calculatedWidth, inocentColor, redColor } from "../../../utils/styles"

export type OnWordClick = (word: Models.BoardWord, row: number, col: number) => void

const useStyles = makeStyles((theme: Theme) => ({
  rows: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    width: calculatedWidth,
    height: calculatedHeight,
  },
  cells: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
  },
  cellWrapper: {
    position: "relative",
    flex: "1 0 auto",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "200px",
    maxHeight: "200px",
    "&:after": {
      content: "",
      float: "left",
      display: "block",
      paddingTop: "100%",
    },
  },
  cell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "2px",
    fontFamily: "Teko",
    userSelect: "none",
    [theme.breakpoints.down(300)]: {
      fontSize: "10px",
    },
    [theme.breakpoints.between(300, 600)]: {
      fontSize: "14px",
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: "26px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "32px",
    },
  },
}))

interface WordsBoardProps {
  userId: string
  game: Models.CodeNamesGame
  board: Models.WordsBoard
  revealWords: boolean
  onWordClick?: OnWordClick
}

export const WordsBoard: React.FC<WordsBoardProps> = ({ userId, game, board, onWordClick, revealWords }) => {
  const classes = useStyles()
  const s = 5

  const forSpyMaster = game.redTeam.spyMaster === userId || game.blueTeam.spyMaster === userId

  return (
    <div className={classes.rows}>
      {R.range(0, s).map(row => (
        <div key={row} className={classes.cells}>
          {board[row].map((word, col) => (
            <WordView
              key={col}
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
  game: Models.CodeNamesGame
  word: Models.BoardWord
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

  const canReveal = GameRules.revealWord(userId, row, col)(game) === undefined

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
      [Models.WordType.red]: {
        color: common.white,
        border: `5px solid ${redColor}`,
      },
      [Models.WordType.blue]: {
        color: common.white,
        border: `5px solid ${blueColor}`,
      },
      [Models.WordType.inocent]: {
        backgroundColor: common.white,
        border: `5px solid ${common.white}`,
        color: common.black,
      },
      [Models.WordType.assassin]: {
        backgroundColor: common.black,
        border: `5px solid ${common.black}`,
        color: common.white,
      },
    },
    revealed: {
      [Models.WordType.red]: {
        backgroundColor: redColor,
        border: `3px solid ${redColor}`,
        color: common.black,
      },
      [Models.WordType.blue]: {
        backgroundColor: blueColor,
        border: `3px solid ${blueColor}`,
        color: common.white,
      },
      [Models.WordType.inocent]: {
        backgroundColor: inocentColor,
        border: `3px solid ${inocentColor}`,
        color: common.black,
      },
      [Models.WordType.assassin]: {
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
