import { GameModels, GameRules } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Typography,
  Divider,
  Box,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material"
import {
  Settings as SettingsIcon,
  People as PeopleIcon,
  Shuffle as ShuffleIcon,
  PersonAdd as PersonAddIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  SportsEsports as GamepadIcon,
} from "@mui/icons-material"
import React from "react"
import { getFlagImage } from "../../../assets/images"
import { EmitMessage } from "../../../utils/types"
import { InvitePlayersDialog } from "./InvitePlayersDialog"
import { Teams } from "./Teams"
import { useApi } from "../../../utils/useApi"

interface SetupGameProps {
  emitMessage: EmitMessage
  game: GameModels.CodeNamesGame
  userId: string
  isDialog?: boolean
}

export const SetupGame: React.FC<SetupGameProps> = ({ emitMessage, game, userId, isDialog = false }) => {
  const gameId = game.gameId

  const [invitePlayersOpened, openInvitePlayers] = React.useState(false)
  const [newGameDialogOpened, setNewGameDialogOpened] = React.useState(false)
  const [config, setConfig] = React.useState(game.config)
  const { languages, turnTimeouts, variants } = useApi()

  React.useEffect(() => {
    setConfig(game.config)
  }, [game.config])

  const restartGame = () => {
    emitMessage(Messages.restartGame({ gameId, userId }))
  }

  const setSpyMaster = (team: GameModels.Teams) => {
    emitMessage(Messages.setSpyMaster({ gameId, userId, team }))
  }

  const joinTeam = (team: GameModels.Teams) => {
    emitMessage(Messages.joinTeam({ gameId, userId, team }))
  }

  const updateConfig = (config: Partial<GameModels.GameConfig>) => {
    setConfig(c => {
      const newConfig = { ...c, ...config }
      emitMessage(Messages.updateConfig({ gameId: game.gameId, userId, config: newConfig }))
      return newConfig
    })
  }

  const changeResponseTimeOut = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value)
    updateConfig({ turnTimeoutSec: value === 0 ? undefined : value })
  }

  const changeLanguage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as string
    updateConfig({ language: value === "" ? undefined : value })
  }

  const changeVariant = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as string
    updateConfig({ variant: value as GameModels.GameVariant })
  }

  const randomizeTeams = () => {
    emitMessage(Messages.randomizeTeam({ gameId, userId }))
  }

  const startGame = (config: GameModels.GameConfig) => {
    emitMessage(Messages.startGame({ gameId, userId, config }))
  }

  const closeNewGameDialog = (cancel: boolean) => {
    setNewGameDialogOpened(false)
    if (!cancel) {
      restartGame()
    }
  }

  const canStartGame = GameRules.startGame(config)(game) === undefined
  const canRandomizeTeams = GameRules.randomizeTeams(game) === undefined

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: isDialog ? "100%" : 800,
        margin: isDialog ? 0 : "0 auto",
        padding: 2,
      }}
    >
      <ConfirmNewGameDialog open={newGameDialogOpened} closeNewGameDialog={closeNewGameDialog} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
          {/* Game Configuration */}
          {game.state === GameModels.GameStates.idle && (
            <Card
              sx={{ borderRadius: 2, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-2px)" } }}
              elevation={2}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                  <SettingsIcon sx={{ marginRight: 1, color: "primary.main" }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Game Configuration
                  </Typography>
                </Box>
                <Divider sx={{ marginBottom: 2 }} />

                <Box sx={{ display: "flex", gap: 2, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                  <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 0" }, minWidth: "200px" }}>
                    <FormControl component="fieldset" sx={{ width: "100%", marginBottom: 1 }}>
                      <FormLabel
                        component="legend"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                          marginTop: 0,
                          marginBottom: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <GamepadIcon sx={{ marginRight: 1 }} />
                        Game Variant
                      </FormLabel>
                      <RadioGroup
                        value={config.variant || GameModels.GameVariant.classic}
                        onChange={changeVariant}
                        sx={{ marginTop: 1 }}
                      >
                        {variants ? (
                          variants.map(v => (
                            <FormControlLabel
                              key={v.name}
                              value={v.name}
                              control={<Radio color="primary" />}
                              label={v.displayName}
                              sx={{ marginBottom: 0.5 }}
                            />
                          ))
                        ) : (
                          <FormControlLabel
                            value={GameModels.GameVariant.classic}
                            control={<Radio color="primary" />}
                            label="Classic"
                            sx={{ marginBottom: 0.5 }}
                          />
                        )}
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 0" }, minWidth: "200px" }}>
                    <FormControl component="fieldset" sx={{ width: "100%", marginBottom: 1 }}>
                      <FormLabel
                        component="legend"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                          marginTop: 0,
                          marginBottom: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <LanguageIcon sx={{ marginRight: 1 }} />
                        Language
                      </FormLabel>
                      <RadioGroup value={config.language || ""} onChange={changeLanguage} sx={{ marginTop: 1 }}>
                        {languages
                          ? languages.map(l => (
                              <FormControlLabel
                                key={l}
                                value={l}
                                control={<Radio color="primary" />}
                                label={
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Box
                                      component="img"
                                      src={getFlagImage(l)}
                                      alt={`${l} flag`}
                                      sx={{ width: 20, height: 15, marginRight: 1, borderRadius: 0.5 }}
                                    />
                                    {l}
                                  </Box>
                                }
                                sx={{ marginBottom: 0.5 }}
                              />
                            ))
                          : null}
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 0" }, minWidth: "200px" }}>
                    <FormControl component="fieldset" sx={{ width: "100%", marginBottom: 1 }}>
                      <FormLabel
                        component="legend"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                          marginTop: 0,
                          marginBottom: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ScheduleIcon sx={{ marginRight: 1 }} />
                        Time Limit
                      </FormLabel>
                      <RadioGroup
                        value={config.turnTimeoutSec || 0}
                        onChange={changeResponseTimeOut}
                        sx={{ marginTop: 1 }}
                      >
                        {turnTimeouts ? (
                          turnTimeouts.map(t => (
                            <FormControlLabel
                              key={t.timeoutSec}
                              value={t.timeoutSec}
                              control={<Radio color="primary" />}
                              label={t.description}
                              sx={{ marginBottom: 0.5 }}
                            />
                          ))
                        ) : (
                          <>
                            <FormControlLabel
                              value={0}
                              control={<Radio color="primary" />}
                              label="No limit"
                              sx={{ marginBottom: 0.5 }}
                            />
                            <FormControlLabel
                              value={60}
                              control={<Radio color="primary" />}
                              label="1 minute"
                              sx={{ marginBottom: 0.5 }}
                            />
                            <FormControlLabel
                              value={120}
                              control={<Radio color="primary" />}
                              label="2 minutes"
                              sx={{ marginBottom: 0.5 }}
                            />
                            <FormControlLabel
                              value={180}
                              control={<Radio color="primary" />}
                              label="3 minutes"
                              sx={{ marginBottom: 0.5 }}
                            />
                          </>
                        )}
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Teams Section */}
          <Card
            sx={{ borderRadius: 2, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-2px)" } }}
            elevation={2}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                <PeopleIcon sx={{ marginRight: 1, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Teams
                </Typography>
              </Box>
              <Divider sx={{ marginBottom: 2 }} />
              <Teams game={game} userId={userId} joinTeam={joinTeam} setSpyMaster={setSpyMaster} />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ flex: "1 1 250px" }}>
              <Button
                variant="outlined"
                size="large"
                disabled={!canRandomizeTeams}
                onClick={randomizeTeams}
                startIcon={<ShuffleIcon />}
                fullWidth
                sx={{
                  height: 48,
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: "none",
                }}
              >
                Randomize Teams
              </Button>
            </Box>
            <Box sx={{ flex: "1 1 250px" }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => openInvitePlayers(true)}
                startIcon={<PersonAddIcon />}
                fullWidth
                sx={{
                  height: 48,
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: "none",
                }}
              >
                Invite Players
              </Button>
            </Box>
          </Box>

          {/* Start/Restart Game Button */}
          <Box>
            {game.state === GameModels.GameStates.idle ? (
              <Button
                variant="contained"
                size="large"
                disabled={!canStartGame}
                onClick={() => startGame(config)}
                startIcon={<PlayArrowIcon />}
                fullWidth
                sx={{
                  height: 56,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #1976D2 30%, #0288D1 90%)",
                  },
                }}
              >
                Start Game
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setNewGameDialogOpened(true)}
                startIcon={<RefreshIcon />}
                fullWidth
                sx={{
                  height: 56,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1.1rem",
                }}
              >
                New Game
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <InvitePlayersDialog gameId={gameId} open={invitePlayersOpened} onClose={() => openInvitePlayers(false)} />
    </Box>
  )
}

interface ConfirmNewGameDialogProps {
  open: boolean
  closeNewGameDialog: (cancel: boolean) => void
}

const ConfirmNewGameDialog: React.FC<ConfirmNewGameDialogProps> = ({ open, closeNewGameDialog }) => {
  return (
    <Dialog open={open} onClose={() => closeNewGameDialog(true)}>
      <DialogTitle>{"Confirm starting a new Game?"}</DialogTitle>
      <DialogContent>
        <DialogContentText>The current game will be terminated</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeNewGameDialog(true)} color="primary">
          Cancel
        </Button>
        <Button onClick={() => closeNewGameDialog(false)} color="primary" autoFocus>
          Start new Game
        </Button>
      </DialogActions>
    </Dialog>
  )
}
