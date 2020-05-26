import { common, grey } from "@material-ui/core/colors"
import { makeStyles, Theme } from "@material-ui/core/styles"
import * as R from "ramda"
import React from "react"
import { BoardWord, WordsBoard, WordType } from "../codenames-core/models"
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
    border: "2px solid white",
    textAlign: "center",
    borderRadius: "5px",
    boxShadow: "inset 0 0 10px #000000",
    backgroundColor: grey[200],
    cursor: "pointer",
    fontSize: "8px",
    padding: "25px 10px 25px 10px",
  },
}))

interface WordsBoardViewProps {
  board: WordsBoard
  revealWords: boolean
  onWordClick?: OnWordClick
}

export const WordsBoardView: React.FC<WordsBoardViewProps> = ({ board, onWordClick, revealWords }) => {
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
  word: BoardWord
  row: number
  col: number
  revealWords: boolean
  onWordClick: OnWordClick
}

const WordView: React.FC<WordViewProps> = ({ word, revealWords, onWordClick, row, col }) => {
  const classes = useStyles()

  const styles = {
    revealed: {
      backgroundColor: wordColors[word.type],
      color: word.type === WordType.inocent ? common.black : common.white,
      fontWeight: "bold" as "bold",
    },
  }

  return (
    <div
      style={revealWords || word.revealed ? styles.revealed : undefined}
      className={classes.cell}
      onClick={() => onWordClick(word, row, col)}
    >
      {word.word.toUpperCase()}
    </div>
  )
}
