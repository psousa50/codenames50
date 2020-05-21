import { capitalize, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import * as R from "ramda"
import React from "react"
import { BoardWord, WordsBoard, WordType } from "../codenames-core/models"
import { blueColor, redColor } from "../utils/styles"

export type OnWordClick = (word: BoardWord, row: number, col: number) => void

const wordColors = {
  [WordType.red]: redColor,
  [WordType.blue]: blueColor,
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
    border: "10px solid white",
    backgroundColor: "lightgray",
    padding: 20,
    margin: 30,
    cursor: "pointer",
  },
  word: {
    textAlign: "center",
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
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableBody>
            {R.range(0, s).map(row => (
              <TableRow key={row}>
                {board[row].map((word, col) => (
                  <TableCell
                    key={col}
                    component="th"
                    scope="row"
                    className={classes.cell}
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

  return <div className={classes.word}>{capitalize(word.word)}</div>
}
