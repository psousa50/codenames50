import { Button, createStyles, Grid, makeStyles, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, Player, TeamConfig, Teams } from "../codenames-core/models"
import { teamName } from "../utils/ui"
import { UserView } from "./UserView"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spyMaster: {
      padding: theme.spacing(3),
    },
    member: {
      padding: theme.spacing(1),
    },
  }),
)

interface TeamViewProps {
  team: Teams
  teamConfig: TeamConfig
  players: Player[]
  joinTeam: (team: Teams) => void
}

const TeamView: React.FC<TeamViewProps> = ({ team, teamConfig, players, joinTeam }) => {
  const classes = useStyles()
  const members = players.filter(p => p.team === team && p.userId !== teamConfig.spyMaster)

  return (
    <Grid container spacing={0} direction="column" alignItems="center" justify="center">
      <div>
        <Button size="small" color="secondary" onClick={() => joinTeam(team)}>
          {`Join ${teamName(team)}`}
        </Button>
      </div>
      <div className={classes.spyMaster}>
        <UserView userId={teamConfig.spyMaster} team={team} spyMaster />
      </div>
      {members.map((m, i) => (
        <div className={classes.member}>
          <UserView key={i} userId={m.userId} team={team} />
        </div>
      ))}
    </Grid>
  )
}

interface TeamsViewProps {
  game: CodeNamesGame
  joinTeam: (team: Teams) => void
}

export const TeamsView: React.FC<TeamsViewProps> = ({ game, joinTeam }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <TeamView team={Teams.red} teamConfig={game.redTeam} players={game.players} joinTeam={joinTeam} />
      </Grid>
      <Grid item xs={6}>
        <TeamView team={Teams.blue} teamConfig={game.blueTeam} players={game.players} joinTeam={joinTeam} />
      </Grid>
    </Grid>
  )
}
