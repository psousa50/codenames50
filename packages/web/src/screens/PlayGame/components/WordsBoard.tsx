import { GameRules, GameModels } from "@codenames50/core"
import { common } from "@material-ui/core/colors"
import { makeStyles, Theme } from "@material-ui/core/styles"
import * as R from "ramda"
import React from "react"
import { animated as a, useSpring } from "react-spring"
import { blueColor, calculatedHeight, calculatedWidth, inocentColor, redColor } from "../../../utils/styles"

export type OnWordClick = (word: GameModels.BoardWord, row: number, col: number) => void

interface WordsBoardProps {
  userId: string
  game: GameModels.CodeNamesGame
  board: GameModels.WordsBoard
  revealWords: boolean
  onWordClick?: OnWordClick
}

export const WordsBoard: React.FC<WordsBoardProps> = ({ userId, game, board, onWordClick, revealWords }) => {
  const classes = useStyles()
  const s = board.length

  const forSpyMaster = game.redTeam.spyMaster === userId || game.blueTeam.spyMaster === userId

  return (
    <div className={classes.rows}>
      {R.range(0, s).map(row => (
        <div key={row} className={classes.cells}>
          {board[row].map((word, col) => (
            <Word
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

interface WordProps {
  userId: string
  game: GameModels.CodeNamesGame
  word: GameModels.BoardWord
  row: number
  col: number
  revealWords: boolean
  forSpyMaster: boolean
  onWordClick: OnWordClick
}

const Word: React.FC<WordProps> = ({ userId, game, word, revealWords, forSpyMaster, onWordClick, row, col }) => {
  const classes = useStyles()

  const canReveal = GameRules.revealWord(userId, row, col)(game) === undefined
  const canIntercept = (GameRules as any).interceptWord ? (GameRules as any).interceptWord(userId, row, col)(game) === undefined : false
  const isClickable = canReveal || canIntercept

  const rw = revealWords || word.revealed

  const styles = {
    base: {
      cursor: isClickable ? "pointer" : undefined,
      border: canIntercept ? "3px solid orange" : undefined,
      boxShadow: canIntercept ? "0 0 10px orange" : undefined,
    },
    unrevelead: {
      backgroundColor: common.white,
      color: common.black,
    },
    unrevelead_spyMaster: {
      [GameModels.WordType.red]: {
        color: common.white,
        border: `0.4ch solid ${redColor}`,
      },
      [GameModels.WordType.blue]: {
        color: common.white,
        border: `0.4ch solid ${blueColor}`,
      },
      [GameModels.WordType.inocent]: {
        backgroundColor: common.white,
        border: `0.4ch solid ${common.white}`,
        color: common.black,
      },
      [GameModels.WordType.assassin]: {
        backgroundColor: common.black,
        border: `0.4ch solid ${common.black}`,
        color: common.white,
      },
    },
    revealed: {
      [GameModels.WordType.red]: {
        backgroundColor: redColor,
        color: common.black,
      },
      [GameModels.WordType.blue]: {
        backgroundColor: blueColor,
        color: common.white,
      },
      [GameModels.WordType.inocent]: {
        backgroundColor: inocentColor,
        color: common.black,
      },
      [GameModels.WordType.assassin]: {
        backgroundColor: common.black,
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
    <div className={classes.cellWrapper} onClick={() => isClickable && onWordClick(word, row, col)}>
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

const useStyles = makeStyles((theme: Theme) => ({
  rows: {
    display: "flex",
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
