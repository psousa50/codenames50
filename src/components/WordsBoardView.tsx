import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core"
import { grey } from "@material-ui/core/colors"
import { makeStyles } from "@material-ui/core/styles"
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

const useStyles = makeStyles({
  container: {
    display: "flex",
  },
  table: {
    border: "1px solid black",
  },
  cell: {
    border: "5px solid white",
    textAlign: "center",
    borderRadius: "5px",
    boxShadow: "inset 0 0 10px #000000",
    backgroundColor: "lightgray",
    cursor: "pointer",
  },
  word: {
    textAlign: "center",
    fontSize: 9,
    padding: "20px 5px 20px 5px",
  },
})

interface WordsBoardViewProps {
  board: WordsBoard
  revealWords: boolean
  onWordClick: OnWordClick
}

export const WordsBoardView: React.FC<WordsBoardViewProps> = ({ board, onWordClick, revealWords }) => {
  const classes = useStyles()
  const s = 5

  const styles = (wordType: WordType) => ({
    revealed: {
      backgroundColor: wordColors[wordType],
      color: "white",
      fontWeight: "bold" as "bold",
    },
  })

  return (
    <div className={classes.container}>
      <TableContainer>
        <Table className={classes.table}>
          <TableBody>
            {R.range(0, s).map(row => (
              <TableRow key={row}>
                {board[row].map((word, col) => (
                  <TableCell
                    key={col}
                    component={Paper}
                    scope="row"
                    className={classes.cell}
                    padding="none"
                    style={word.revealed || revealWords ? styles(word.type).revealed : undefined}
                    onClick={() => onWordClick(word, row, col)}
                  >
                    <WordView key={col} word={word} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

interface WordViewProps {
  word: BoardWord
}

const WordView: React.FC<WordViewProps> = ({ word }) => {
  const classes = useStyles()

  return <div className={classes.word}>{word.word.toUpperCase()}</div>
}
