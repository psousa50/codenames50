import {
  Button,
  createStyles,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  makeStyles,
  Theme,
} from "@material-ui/core"
import React from "react"
import { CodeNamesGame, Player, TeamConfig, Teams } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { teamColor } from "../utils/styles"
import { teamName } from "../utils/ui"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      textAlign: "center",
      padding: 0,
      overflow: "scroll",
    },
    item: {
      textAlign: "center",
      padding: 0,
    },
    teamName: {
      fontSize: 26,
      fontWeight: "bold",
    },
    spyMaster: {
      fontSize: 24,
      height: "2rem",
    },
    noSpyMaster: {
      fontSize: 14,
      height: "2rem",
    },
    member: {
      fontSize: 12,
    },
  }),
)

interface TeamViewProps {
  userId: string
  game: CodeNamesGame
  team: Teams
  teamConfig: TeamConfig
  players: Player[]
  joinTeam: (team: Teams) => void
  setSpyMaster: (team: Teams) => void
}

const TeamView: React.FC<TeamViewProps> = ({ userId, game, team, teamConfig, players, joinTeam, setSpyMaster }) => {
  const classes = useStyles()
  const members = players.filter(p => p.team === team && p.userId !== teamConfig.spyMaster)

  const styles = {
    teamColor: {
      color: teamColor(team),
    },
  }

  const canSetSpyMaster = GameRules.setSpyMaster(team)(game) === undefined

  return (
    <List
      className={classes.list}
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader>
          <Button
            disabled={teamConfig.spyMaster === userId || members.find(m => m.userId === userId) !== undefined}
            color="primary"
            onClick={() => joinTeam(team)}
          >
            {`Join ${teamName(team)} Team`}
          </Button>
        </ListSubheader>
      }
    >
      <Divider variant="middle" component="li" />
      <ListItem divider alignItems="center" className={classes.item}>
        <ListItemText
          primary={
            <Button
              disabled={!canSetSpyMaster || teamConfig.spyMaster === userId}
              color="primary"
              onClick={() => setSpyMaster(team)}
            >
              Set me as SpyMaster
            </Button>
          }
        />
      </ListItem>
      <ListItem divider alignItems="center" className={classes.item}>
        <ListItemText
          primary={
            teamConfig.spyMaster ? (
              <div style={styles.teamColor} className={classes.spyMaster}>
                {teamConfig.spyMaster}
              </div>
            ) : (
              <div style={styles.teamColor} className={classes.noSpyMaster}>
                (No SpyMaster yet)
              </div>
            )
          }
        />
      </ListItem>
      {members.map(m => (
        <ListItem key={m.userId} alignItems="center" className={classes.item}>
          <ListItemText style={styles.teamColor} className={classes.member} primary={m.userId} />
        </ListItem>
      ))}
    </List>
  )
}

interface TeamsViewProps {
  userId: string
  game: CodeNamesGame
  joinTeam: (team: Teams) => void
  setSpyMaster: (team: Teams) => void
}

export const TeamsView: React.FC<TeamsViewProps> = ({ userId, game, joinTeam, setSpyMaster }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <TeamView
          userId={userId}
          game={game}
          team={Teams.red}
          teamConfig={game.redTeam}
          players={game.players}
          joinTeam={joinTeam}
          setSpyMaster={setSpyMaster}
        />
      </Grid>
      <Grid item xs={6}>
        <TeamView
          userId={userId}
          game={game}
          team={Teams.blue}
          teamConfig={game.blueTeam}
          players={game.players}
          joinTeam={joinTeam}
          setSpyMaster={setSpyMaster}
        />
      </Grid>
    </Grid>
  )
}
