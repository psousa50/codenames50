import { Button, Table, TableBody, TableCell, TableRow } from "@material-ui/core"
import * as R from "ramda"
import React from "react"

const styles = {
  numbers: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "row" as "row",
    alignItems: "center",
  },
  number: {
    display: "flex",
    width: 24,
    height: 24,
    border: "1px solid black",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as "center",
  },
}

interface HintViewProps {
  hintWord: string
  hintWordCount: number | undefined
  onChange?: (hintWord: string, hintWordCount?: number) => void
  sendHint?: (hintWord: string, hintWordCount: number) => void
}

export const HintView: React.FC<HintViewProps> = ({ hintWord, hintWordCount, onChange, sendHint }) => {
  return (
    <Table>
      <colgroup>
        <col style={{ width: "5%" }} />
        <col style={{ width: "50%" }} />
        <col style={{ width: "45%" }} />
      </colgroup>
      <TableBody>
        <TableRow>
          <TableCell>Hint:</TableCell>
          <TableCell>
            <input value={hintWord} onChange={event => onChange && onChange(event.target.value, hintWordCount)} />
          </TableCell>
          <TableCell>
            {sendHint && (
              <Button color="secondary" onClick={() => hintWordCount && sendHint && sendHint(hintWord, hintWordCount)}>
                Send Hint
              </Button>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Count:</TableCell>
          <TableCell colSpan={2}>
            <div style={styles.numbers}>
              {R.range(1, 10).map(c => (
                <HintCount
                  key={c}
                  count={c}
                  selected={c === hintWordCount}
                  onChange={count => onChange && onChange(hintWord, count)}
                />
              ))}
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

interface HintCountProps {
  count: number
  selected: boolean
  onChange: (n: number) => void
}

const HintCount: React.FC<HintCountProps> = ({ count: n, selected, onChange }) => (
  <div style={{ ...styles.number, backgroundColor: selected ? "gray" : undefined }} onClick={() => onChange(n)}>
    {n}
  </div>
)
