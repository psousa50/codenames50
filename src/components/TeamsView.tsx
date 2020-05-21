import { Button, Table, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, TeamConfig, Teams } from "../codenames-core/models"
import { blueColor, redColor } from "../utils/styles"

interface TeamViewProps {
  game: CodeNamesGame
  joinTeam: (team: Teams) => void
}

const styles = (color: string) => ({
  table: {
    border: `2px solid ${color}`,
    backgroundColor: "yellow",
  },
  wordsLeft: {
    fontSize: "50px",
    padding: "20px",
    color,
  },
  spyMaster: {
    fontSize: "22px",
    backgroundColor: color,
    color: "white",
    padding: "10px",
  },
  other: {
    fontSize: "16px",
    color,
  },
  button: {
    color: "white",
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
      <div key={i} style={style.other}>
        {o.userId}
      </div>
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
            <TableCell align="center" style={redStyles.wordsLeft}>
              {game.redTeam.wordsLeft}
            </TableCell>
            <TableCell align="center" style={blueStyles.wordsLeft}>
              {game.blueTeam.wordsLeft}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">
              <span style={redStyles.spyMaster}>{game.redTeam.spyMaster}</span>
            </TableCell>
            <TableCell align="center">
              <span style={blueStyles.spyMaster}>{game.blueTeam.spyMaster}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">{members(Teams.red, game.redTeam, redStyles)}</TableCell>
            <TableCell align="center">{members(Teams.blue, game.blueTeam, blueStyles)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">{joinButton(Teams.red, redStyles)}</TableCell>
            <TableCell align="center">{joinButton(Teams.blue, blueStyles)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
