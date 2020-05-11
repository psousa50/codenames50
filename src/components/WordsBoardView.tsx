import * as R from "ramda"
import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { WordsBoard, BoardWord } from "../api/models"
import { Paper, TableContainer, Table, TableBody, TableRow, TableCell, capitalize } from "@material-ui/core"

interface WordsBoardViewProps {
  board: WordsBoard
}

const useStyles = makeStyles({
  container: {
    display: "flex",
  },
  table: {},
  cell: {
    border: "1px solid black",
    padding: 20,
    minWidth: "20%",
    maxWidth: "20%",
  },
  word: {
    textAlign: "center",
  },
})

export const WordsBoardView: React.FC<WordsBoardViewProps> = ({ board }) => {
  const classes = useStyles()
  const s = 5

  return (
    <div className={classes.container}>
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableBody>
            {R.range(0, s).map(r => (
              <TableRow key={r}>
                {board.slice(r * 5 + 5, r * 5 + 5 + 5).map((word, c) => (
                  <TableCell component="th" scope="row" className={classes.cell}>
                    <WordView key={c} word={word} />
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
