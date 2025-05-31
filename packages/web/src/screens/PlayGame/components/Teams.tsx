import { GameModels } from "@codenames50/core"
import { Button, Card, CardContent, Typography, Box, Avatar, Chip, IconButton, Tooltip, Divider } from "@mui/material"
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material"
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
  const teamMembers = players.filter(p => p.team === team)
  const regularMembers = teamMembers.filter(p => p.userId !== teamConfig.spyMaster)

  const isUserOnThisTeam = teamMembers.some(p => p.userId === userId)
  const isUserSpyMaster = teamConfig.spyMaster === userId
  const canJoinTeam = !isUserOnThisTeam

  const teamName = team === GameModels.Teams.red ? "Red Team" : "Blue Team"
  const teamColorValue = teamColor(team)

  return (
    <Card
      sx={{
        height: "100%",
        border: "2px solid",
        borderColor: teamColorValue,
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        {/* Team Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "1.25rem",
              color: teamColorValue,
            }}
          >
            {teamName}
          </Typography>
          <Chip
            label={`${teamMembers.length} ${teamMembers.length === 1 ? "Player" : "Players"}`}
            size="small"
            sx={{
              backgroundColor: teamColorValue,
              color: "white",
            }}
          />
        </Box>

        <Divider sx={{ margin: "12px 0" }} />

        {/* Spy Master Section */}
        <Box sx={{ marginBottom: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: 1,
            }}
          >
            <TrophyIcon sx={{ marginRight: 1, fontSize: 20, color: teamColorValue }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Spy Master
            </Typography>
          </Box>

          {teamConfig.spyMaster ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                padding: 1.5,
                borderRadius: 1,
                transition: "all 0.2s ease",
                backgroundColor: `${teamColorValue}10`,
                border: `1px solid ${teamColorValue}30`,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  marginRight: 1.5,
                  backgroundColor: teamColorValue,
                }}
              >
                <StarIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    marginBottom: 0.5,
                  }}
                >
                  {teamConfig.spyMaster}
                </Typography>
                {isUserSpyMaster && (
                  <Chip
                    label="You"
                    size="small"
                    sx={{
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
                    sx={{
                      padding: 0.5,
                      marginLeft: 1,
                      color: teamColorValue,
                    }}
                  >
                    <StarBorderIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", padding: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  marginBottom: 1,
                }}
              >
                No Spy Master assigned
              </Typography>
              {isUserOnThisTeam && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<StarIcon />}
                  onClick={() => setSpyMaster(team)}
                  sx={{
                    marginTop: 1,
                    borderColor: teamColorValue,
                    color: teamColorValue,
                  }}
                >
                  Become Spy Master
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ margin: "12px 0" }} />

        {/* Team Members Section */}
        <Box sx={{ marginBottom: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 500,
              marginBottom: 1,
              color: "text.secondary",
            }}
          >
            Team Members
          </Typography>

          {regularMembers.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {regularMembers.map(member => (
                <Box
                  key={member.userId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: 0.5,
                    borderRadius: 0.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "action.hover",
                      transform: "translateX(2px)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      marginRight: 1,
                      backgroundColor: `${teamColorValue}15`,
                      color: teamColorValue,
                      border: `1px solid ${teamColorValue}30`,
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {member.userId}
                    {member.userId === userId && (
                      <Chip
                        label="You"
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 18,
                          fontSize: "0.7rem",
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
                        sx={{
                          padding: 0.5,
                          color: teamColorValue,
                        }}
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
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No team members yet
              </Typography>
            )
          )}
        </Box>

        {/* Join Team Button */}
        {canJoinTeam && (
          <>
            <Divider sx={{ margin: "12px 0" }} />
            <Button
              variant="contained"
              fullWidth
              startIcon={<PersonAddIcon />}
              onClick={() => joinTeam(team)}
              sx={{
                height: 48,
                fontWeight: 500,
                textTransform: "none",
                backgroundColor: teamColorValue,
                color: "white",
                "&:hover": {
                  opacity: 0.9,
                  backgroundColor: teamColorValue,
                },
              }}
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
  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        width: "100%",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Team
          userId={userId}
          game={game}
          team={GameModels.Teams.red}
          teamConfig={game.redTeam}
          players={game.players}
          joinTeam={joinTeam}
          setSpyMaster={setSpyMaster}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Team
          userId={userId}
          game={game}
          team={GameModels.Teams.blue}
          teamConfig={game.blueTeam}
          players={game.players}
          joinTeam={joinTeam}
          setSpyMaster={setSpyMaster}
        />
      </Box>
    </Box>
  )
}
