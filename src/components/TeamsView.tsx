import { Button, Table, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, TeamConfig, Teams } from "../codenames-core/models"
import { blueColor, redColor } from "../utils/styles"

interface TeamViewProps {
  game: CodeNamesGame
  joinTeam: (team: Teams) => void
}

const styles = (color: string) => ({
  container: {},
  table: {
    border: `2px solid ${color}`,
    backgroundColor: "yellow",
  },
  wordsLeft: {
    fontSize: "30px",
    padding: "20px",
    color,
  },
  spyMaster: {
    fontSize: "16px",
    color,
    border: `1px solid ${color}`,
  },
  other: {
    fontSize: "12px",
    color,
  },
  button: {
    backgroundColor: color,
  },
})

type Styles = ReturnType<typeof styles>

export const TeamsView: React.FC<TeamViewProps> = ({ game, joinTeam }) => {
  const redStyles = styles(redColor)
  const blueStyles = styles(blueColor)

  const members = (team: Teams, teamInfo: TeamConfig, style: Styles) => {
    const members = game.players.filter(p => p.team === team)
    const others = members.filter(m => m.userId !== teamInfo.spyMaster)

    return others.map((o, i) => (
      <Table>
        <TableRow key={i}>
          <TableCell style={style.other}>{o.userId}</TableCell>
        </TableRow>
      </Table>
    ))
  }

  const joinButton = (team: Teams, style: Styles) => (
    <Button style={style.button} onClick={() => joinTeam(team)}>
      Join Team
    </Button>
  )

  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell style={redStyles.wordsLeft}>{game.redTeam.wordsLeft}</TableCell>
            <TableCell style={blueStyles.wordsLeft}>{game.blueTeam.wordsLeft}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={redStyles.spyMaster}>{game.redTeam.spyMaster}</TableCell>
            <TableCell style={blueStyles.spyMaster}>{game.blueTeam.spyMaster}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{members(Teams.red, game.redTeam, redStyles)}</TableCell>
            <TableCell>{members(Teams.blue, game.blueTeam, blueStyles)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{joinButton(Teams.red, redStyles)}</TableCell>
            <TableCell>{joinButton(Teams.blue, blueStyles)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
