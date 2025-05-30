import { GameModels } from "@codenames50/core"
import {
  Button,
  makeStyles,
  Theme,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Grid,
} from "@material-ui/core"
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  EmojiEvents as TrophyIcon,
} from "@material-ui/icons"
import React from "react"
import { teamColor } from "../../../utils/styles"

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
  const teamMembers = players.filter(p => p.team === team)
  const regularMembers = teamMembers.filter(p => p.userId !== teamConfig.spyMaster)

  const isUserOnThisTeam = teamMembers.some(p => p.userId === userId)
  const isUserSpyMaster = teamConfig.spyMaster === userId
  const canJoinTeam = !isUserOnThisTeam

  const teamName = team === GameModels.Teams.red ? "Red Team" : "Blue Team"
  const teamColorValue = teamColor(team)

  return (
    <Card className={classes.teamCard} style={{ borderColor: teamColorValue }}>
      <CardContent>
        {/* Team Header */}
        <Box className={classes.teamHeader}>
          <Typography variant="h6" className={classes.teamName} style={{ color: teamColorValue }}>
            {teamName}
          </Typography>
          <Chip
            label={`${teamMembers.length} ${teamMembers.length === 1 ? "Player" : "Players"}`}
            size="small"
            style={{
              backgroundColor: teamColorValue,
              color: "white",
            }}
          />
        </Box>

        <Divider className={classes.divider} />

        {/* Spy Master Section */}
        <Box className={classes.spyMasterSection}>
          <Box className={classes.spyMasterHeader}>
            <TrophyIcon className={classes.trophyIcon} style={{ color: teamColorValue }} />
            <Typography variant="subtitle1" className={classes.spyMasterTitle}>
              Spy Master
            </Typography>
          </Box>

          {teamConfig.spyMaster ? (
            <Box
              className={classes.spyMasterCard}
              style={{
                backgroundColor: `${teamColorValue}10`,
                border: `1px solid ${teamColorValue}30`,
              }}
            >
              <Avatar className={classes.spyMasterAvatar} style={{ backgroundColor: teamColorValue }}>
                <StarIcon />
              </Avatar>
              <Box className={classes.spyMasterInfo}>
                <Typography variant="subtitle1" className={classes.spyMasterName}>
                  {teamConfig.spyMaster}
                </Typography>
                {isUserSpyMaster && (
                  <Chip
                    label="You"
                    size="small"
                    style={{
                      backgroundColor: teamColorValue,
                      color: "white",
                    }}
                  />
                )}
              </Box>
              {!isUserSpyMaster && isUserOnThisTeam && (
                <Tooltip title="Take over as Spy Master">
                  <IconButton
                    size="small"
                    onClick={() => setSpyMaster(team)}
                    className={classes.takeOverButton}
                    style={{ color: teamColorValue }}
                  >
                    <StarBorderIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ) : (
            <Box className={classes.emptySpyMaster}>
              <Typography variant="body2" className={classes.emptyText}>
                No Spy Master assigned
              </Typography>
              {isUserOnThisTeam && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<StarIcon />}
                  onClick={() => setSpyMaster(team)}
                  className={classes.becomeSpyMasterBtn}
                  style={{ borderColor: teamColorValue, color: teamColorValue }}
                >
                  Become Spy Master
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Divider className={classes.divider} />

        {/* Team Members Section */}
        <Box className={classes.membersSection}>
          <Typography variant="subtitle2" className={classes.membersTitle}>
            Team Members
          </Typography>

          {regularMembers.length > 0 ? (
            <Box className={classes.membersList}>
              {regularMembers.map(member => (
                <Box key={member.userId} className={classes.memberItem}>
                  <Avatar
                    className={classes.memberAvatar}
                    style={{
                      backgroundColor: `${teamColorValue}15`,
                      color: teamColorValue,
                      border: `1px solid ${teamColorValue}30`,
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="body2" className={classes.memberName}>
                    {member.userId}
                    {member.userId === userId && (
                      <Chip
                        label="You"
                        size="small"
                        variant="outlined"
                        className={classes.youChip}
                        style={{
                          borderColor: teamColorValue,
                          color: teamColorValue,
                        }}
                      />
                    )}
                  </Typography>
                  {member.userId === userId && (
                    <Tooltip title="Become Spy Master">
                      <IconButton
                        size="small"
                        onClick={() => setSpyMaster(team)}
                        className={classes.starButton}
                        style={{ color: teamColorValue }}
                      >
                        <StarBorderIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            !teamConfig.spyMaster && (
              <Typography variant="body2" className={classes.emptyText}>
                No team members yet
              </Typography>
            )
          )}
        </Box>

        {/* Join Team Button */}
        {canJoinTeam && (
          <>
            <Divider className={classes.divider} />
            <Button
              variant="contained"
              fullWidth
              startIcon={<PersonAddIcon />}
              onClick={() => joinTeam(team)}
              className={classes.joinButton}
              style={{ backgroundColor: teamColorValue }}
            >
              Join {teamName}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
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
    <Grid container spacing={3} className={classes.teamsContainer}>
      <Grid item xs={12} md={6}>
        <Team
          userId={userId}
          game={game}
          team={GameModels.Teams.red}
          teamConfig={game.redTeam}
          players={game.players}
          joinTeam={joinTeam}
          setSpyMaster={setSpyMaster}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Team
          userId={userId}
          game={game}
          team={GameModels.Teams.blue}
          teamConfig={game.blueTeam}
          players={game.players}
          joinTeam={joinTeam}
          setSpyMaster={setSpyMaster}
        />
      </Grid>
    </Grid>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  teamsContainer: {
    width: "100%",
  },
  teamCard: {
    height: "100%",
    border: "2px solid",
    borderRadius: theme.spacing(2),
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
    },
  },
  teamHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  teamName: {
    fontWeight: 600,
    fontSize: "1.25rem",
  },
  divider: {
    margin: theme.spacing(1.5, 0),
  },
  spyMasterSection: {
    marginBottom: theme.spacing(1),
  },
  spyMasterHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  trophyIcon: {
    marginRight: theme.spacing(1),
    fontSize: 20,
  },
  spyMasterTitle: {
    fontWeight: 500,
  },
  spyMasterCard: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    transition: "all 0.2s ease",
  },
  spyMasterAvatar: {
    width: 40,
    height: 40,
    marginRight: theme.spacing(1.5),
  },
  spyMasterInfo: {
    flex: 1,
  },
  spyMasterName: {
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
  },
  emptySpyMaster: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
  emptyText: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  becomeSpyMasterBtn: {
    marginTop: theme.spacing(1),
  },
  membersSection: {
    marginBottom: theme.spacing(1),
  },
  membersTitle: {
    fontWeight: 500,
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  membersList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  memberItem: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      transform: "translateX(2px)",
    },
  },
  memberAvatar: {
    width: 32,
    height: 32,
    marginRight: theme.spacing(1),
  },
  memberName: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  youChip: {
    height: 18,
    fontSize: "0.7rem",
  },
  starButton: {
    padding: theme.spacing(0.5),
  },
  takeOverButton: {
    padding: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
  },
  joinButton: {
    height: 48,
    fontWeight: 500,
    textTransform: "none",
    color: "white",
    "&:hover": {
      opacity: 0.9,
    },
  },
}))
