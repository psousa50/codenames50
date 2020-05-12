import * as R from "ramda"
import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { WordsBoard, BoardWord, WordType } from "../api/models"
import { Paper, TableContainer, Table, TableBody, TableRow, TableCell, capitalize } from "@material-ui/core"

export type OnWordClick = (word: BoardWord, row: number, col: number) => void

const wordColors = {
  [WordType.red]: "red",
  [WordType.blue]: "blue",
  [WordType.inocent]: "gray",
  [WordType.assassin]: "black",
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
    padding: 20,
    minWidth: "20%",
    maxWidth: "20%",
    margin: 30,
    cursor: "pointer",
  },
  word: {
    textAlign: "center",
  },
})

interface WordsBoardViewProps {
  board: WordsBoard
  onWordClick: OnWordClick
}

export const WordsBoardView: React.FC<WordsBoardViewProps> = ({ board, onWordClick }) => {
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
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableBody>
            {R.range(0, s).map(r => (
              <TableRow key={r}>
                {board[r].map((word, c) => (
                  <TableCell
                    key={c}
                    component="th"
                    scope="row"
                    className={classes.cell}
                    style={word.revealed ? styles(word.type).revealed : undefined}
                  >
                    <WordView key={c} word={word} row={r} col={c} onWordClick={onWordClick} />
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
  row: number
  col: number
  onWordClick: OnWordClick
}

const WordView: React.FC<WordViewProps> = ({ word, row, col, onWordClick }) => {
  const classes = useStyles()

  return (
    <div className={classes.word} onClick={() => onWordClick(word, row, col)}>
      {capitalize(word.word)}
    </div>
  )
}
