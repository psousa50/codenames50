import { common, grey } from "@material-ui/core/colors"
import { makeStyles, Theme } from "@material-ui/core/styles"
import * as R from "ramda"
import React from "react"
import { animated as a, useSpring } from "react-spring"
import { BoardWord, CodeNamesGame, WordsBoard, WordType } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { blueColor, blueColorLight, inocentColor, inocentColorLight, redColor, redColorLight } from "../utils/styles"

const background = common.white

export type OnWordClick = (word: BoardWord, row: number, col: number) => void

const wordColors = {
  [WordType.red]: [background, common.black],
  [WordType.blue]: [background, common.black],
  [WordType.inocent]: [background, common.black],
  [WordType.assassin]: [background, common.black],
}

const wordRevealedColors = {
  [WordType.red]: [redColor, common.white],
  [WordType.blue]: [blueColor, common.white],
  [WordType.inocent]: [inocentColor, common.black],
  [WordType.assassin]: [common.black, common.white],
}

const wordSpyMasterColors = {
  [WordType.red]: [redColorLight, common.white],
  [WordType.blue]: [blueColorLight, common.white],
  [WordType.inocent]: [inocentColorLight, common.black],
  [WordType.assassin]: [common.black, common.white],
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

  const rw = revealWords || word.revealed
  const colors = (forSpyMaster ? wordSpyMasterColors : wordColors)[word.type]
  const revealedColors = wordRevealedColors[word.type]

  const styles = {
    normal: {
      cursor: canReveal ? "pointer" : undefined,
      backgroundColor: colors[0],
      color: colors[1],
    },
    revealed: {
      // backgroundColor: forSpyMaster && !word.revealed ? dimmedWordColors[word.type] : wordColors[word.type],
      backgroundColor: revealedColors[0],
      color: revealedColors[1],
    },
  }

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
