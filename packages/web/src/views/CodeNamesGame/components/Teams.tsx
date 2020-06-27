import { GameModels, GameRules } from "@codenames50/core"
import {
  Button,
  createStyles,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  makeStyles,
  Theme,
} from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import React from "react"
import { teamColor } from "../../../utils/styles"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grid: {
      display: "flex",
      flexDirection: "row",
      alignItems: "top",
      justifyContent: "center",
      padding: "5px",
    },
    list: {
      textAlign: "center",
      padding: 0,
    },
    item: {
      textAlign: "center",
      padding: 0,
    },
    teamName: {
      fontWeight: "bold",
    },
  }),
)

interface TeamProps {
  userId: string
  game: GameModels.CodeNamesGame
  team: GameModels.Teams
  teamConfig: GameModels.TeamConfig
  players: GameModels.Player[]
  joinTeam: (team: GameModels.Teams) => void
  setSpyMaster: (team: GameModels.Teams) => void
}

const Team: React.FC<TeamProps> = ({ userId, game, team, teamConfig, players, joinTeam, setSpyMaster }) => {
  const classes = useStyles()
  const members = players.filter(p => p.team === team && p.userId !== teamConfig.spyMaster)

  const canSetSpyMaster = GameRules.setSpyMaster(team)(game) === undefined

  const styles = {
    team: {
      width: "100%",
      border: `2px solid ${teamColor(team)}`,
      margin: "5px",
      padding: "10px",
    },
  }

  return (
    <div style={styles.team}>
      <List
        className={classes.list}
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader>
            <Button
              size="small"
              variant="contained"
              disabled={teamConfig.spyMaster === userId || members.find(m => m.userId === userId) !== undefined}
              color="primary"
              onClick={() => joinTeam(team)}
            >
              Join
            </Button>
          </ListSubheader>
        }
      >
        <Divider variant="middle" component="li" />
        <ListItem divider alignItems="center" className={classes.item}>
          <ListItemText
            primary={
              <Button
                size="small"
                variant="contained"
                disabled={!canSetSpyMaster || teamConfig.spyMaster === userId}
                color="primary"
                onClick={() => setSpyMaster(team)}
              >
                Spy Master
              </Button>
            }
          />
        </ListItem>
        <ListItem divider alignItems="center" className={classes.item}>
          <ListItemText
            primary={
              teamConfig.spyMaster ? (
                <ListItemText>
                  <Typography variant="h6">{teamConfig.spyMaster}</Typography>
                </ListItemText>
              ) : (
                <ListItemText>
                  <Typography variant="h6">{"(No SpyMaster)"}</Typography>
                </ListItemText>
              )
            }
          />
        </ListItem>
        {members.map(m => (
          <ListItem key={m.userId} alignItems="center" className={classes.item}>
            <ListItemText>
              <Typography variant="subtitle1">{m.userId}</Typography>
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </div>
  )
}

interface TeamsProps {
  userId: string
  game: GameModels.CodeNamesGame
  joinTeam: (team: GameModels.Teams) => void
  setSpyMaster: (team: GameModels.Teams) => void
}

export const Teams: React.FC<TeamsProps> = ({ userId, game, joinTeam, setSpyMaster }) => {
  const classes = useStyles()

  return (
    <div className={classes.grid}>
      <Team
        userId={userId}
        game={game}
        team={GameModels.Teams.red}
        teamConfig={game.redTeam}
        players={game.players}
        joinTeam={joinTeam}
        setSpyMaster={setSpyMaster}
      />
      <Team
        userId={userId}
        game={game}
        team={GameModels.Teams.blue}
        teamConfig={game.blueTeam}
        players={game.players}
        joinTeam={joinTeam}
        setSpyMaster={setSpyMaster}
      />
    </div>
  )
}
