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
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Paper,
  Grid,
  Typography,
  Divider,
  Box,
  Card,
  CardContent,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@material-ui/core"
import {
  Settings as SettingsIcon,
  People as PeopleIcon,
  Shuffle as ShuffleIcon,
  PersonAdd as PersonAddIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  GamepadOutlined as GamepadIcon,
} from "@material-ui/icons"
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
  const classes = useStyles()

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
    <div className={isDialog ? classes.dialogContainer : classes.container}>
      <ConfirmNewGameDialog open={newGameDialogOpened} closeNewGameDialog={closeNewGameDialog} />

      {!isDialog && (
        <Box className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            Game Setup
          </Typography>
          <Chip
            label={game.state === GameModels.GameStates.running ? "Game In Progress" : "Setting Up"}
            color={game.state === GameModels.GameStates.running ? "secondary" : "primary"}
            variant="outlined"
            className={classes.statusChip}
          />
        </Box>
      )}

      <Grid container spacing={3} className={classes.gridContainer}>
        {/* Game Configuration */}
        {game.state === GameModels.GameStates.idle && (
          <Grid item xs={12}>
            <Card className={classes.card} elevation={2}>
              <CardContent>
                <Box className={classes.sectionHeader}>
                  <SettingsIcon className={classes.sectionIcon} />
                  <Typography variant="h6" className={classes.sectionTitle}>
                    Game Configuration
                  </Typography>
                </Box>
                <Divider className={classes.divider} />

                <Grid container spacing={2} className={classes.radioGroupContainer}>
                  <Grid item xs={12} md={4}>
                    <FormControl component="fieldset" className={classes.formControl}>
                      <FormLabel component="legend" className={classes.radioGroupLabel}>
                        <Box display="flex" alignItems="center">
                          <GamepadIcon className={classes.inputIcon} />
                          Game Variant
                        </Box>
                      </FormLabel>
                      <RadioGroup
                        value={config.variant || GameModels.GameVariant.classic}
                        onChange={changeVariant}
                        className={classes.radioGroup}
                      >
                        {variants ? (
                          variants.map(v => (
                            <FormControlLabel
                              key={v.name}
                              value={v.name}
                              control={<Radio color="primary" />}
                              label={v.displayName}
                              className={classes.radioOption}
                            />
                          ))
                        ) : (
                          <FormControlLabel
                            value={GameModels.GameVariant.classic}
                            control={<Radio color="primary" />}
                            label="Classic"
                            className={classes.radioOption}
                          />
                        )}
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl component="fieldset" className={classes.formControl}>
                      <FormLabel component="legend" className={classes.radioGroupLabel}>
                        <Box display="flex" alignItems="center">
                          <LanguageIcon className={classes.inputIcon} />
                          Language
                        </Box>
                      </FormLabel>
                      <RadioGroup
                        value={config.language || ""}
                        onChange={changeLanguage}
                        className={classes.radioGroup}
                      >
                        {languages ? (
                          languages.map(l => (
                            <FormControlLabel
                              key={l}
                              value={l}
                              control={<Radio color="primary" />}
                              label={
                                <Box display="flex" alignItems="center">
                                  <img src={getFlagImage(l)} alt={l} width="20px" style={{ paddingRight: "8px" }} />
                                  {l}
                                </Box>
                              }
                              className={classes.radioOption}
                            />
                          ))
                        ) : (
                          <FormControlLabel
                            value=""
                            control={<Radio color="primary" />}
                            label="Loading..."
                            className={classes.radioOption}
                            disabled
                          />
                        )}
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl component="fieldset" className={classes.formControl}>
                      <FormLabel component="legend" className={classes.radioGroupLabel}>
                        <Box display="flex" alignItems="center">
                          <ScheduleIcon className={classes.inputIcon} />
                          Time Limit
                        </Box>
                      </FormLabel>
                      <RadioGroup
                        value={turnTimeouts ? config.turnTimeoutSec?.toString() || "0" : ""}
                        onChange={changeResponseTimeOut}
                        className={classes.radioGroup}
                      >
                        {turnTimeouts ? (
                          turnTimeouts.map(tt => (
                            <FormControlLabel
                              key={tt.timeoutSec}
                              value={tt.timeoutSec.toString()}
                              control={<Radio color="primary" />}
                              label={tt.description}
                              className={classes.radioOption}
                            />
                          ))
                        ) : (
                          <FormControlLabel
                            value=""
                            control={<Radio color="primary" />}
                            label="Loading..."
                            className={classes.radioOption}
                            disabled
                          />
                        )}
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Teams Section */}
        <Grid item xs={12}>
          <Card className={classes.card} elevation={2}>
            <CardContent>
              <Box className={classes.sectionHeader}>
                <PeopleIcon className={classes.sectionIcon} />
                <Typography variant="h6" className={classes.sectionTitle}>
                  Teams
                </Typography>
              </Box>
              <Divider className={classes.divider} />
              <Teams userId={userId} game={game} joinTeam={joinTeam} setSpyMaster={setSpyMaster} />
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Card className={classes.card} elevation={2}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    disabled={!canRandomizeTeams}
                    variant="outlined"
                    size="large"
                    color="secondary"
                    className={classes.actionButton}
                    onClick={() => randomizeTeams()}
                    startIcon={<ShuffleIcon />}
                    fullWidth
                  >
                    Randomize Teams
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    size="large"
                    color="secondary"
                    className={classes.actionButton}
                    onClick={() => openInvitePlayers(true)}
                    startIcon={<PersonAddIcon />}
                    fullWidth
                  >
                    Invite Players
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  {game.state === GameModels.GameStates.running ? (
                    <Button
                      variant="contained"
                      size="large"
                      color="primary"
                      className={classes.primaryButton}
                      onClick={() => setNewGameDialogOpened(true)}
                      startIcon={<RefreshIcon />}
                      fullWidth
                    >
                      Start New Game
                    </Button>
                  ) : (
                    <Button
                      disabled={!canStartGame}
                      variant="contained"
                      size="large"
                      color="primary"
                      className={classes.primaryButton}
                      onClick={() => startGame(config)}
                      startIcon={<PlayArrowIcon />}
                      fullWidth
                    >
                      Start Game
                    </Button>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <InvitePlayersDialog onClose={() => openInvitePlayers(false)} open={invitePlayersOpened} gameId={game.gameId} />
    </div>
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

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    width: "100%",
    maxWidth: 800,
    margin: "0 auto",
    padding: theme.spacing(2),
  },
  dialogContainer: {
    width: "100%",
    padding: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      gap: theme.spacing(1),
      alignItems: "center",
      textAlign: "center",
    },
  },
  title: {
    fontWeight: 600,
    color: theme.palette.primary.main,
    margin: 0,
    lineHeight: 1.2,
  },
  statusChip: {
    flexShrink: 0,
    alignSelf: "center",
    transform: "translateY(-1px)",
  },
  gridContainer: {
    width: "100%",
  },
  card: {
    borderRadius: theme.spacing(1),
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
    },
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  sectionIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  sectionTitle: {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  divider: {
    marginBottom: theme.spacing(1),
  },
  radioGroupContainer: {
    marginTop: theme.spacing(1),
  },
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(1),
  },
  radioGroupLabel: {
    fontWeight: 500,
    color: theme.palette.text.primary,
    marginTop: 0,
    marginBottom: theme.spacing(1),
    "& .MuiFormLabel-root": {
      color: theme.palette.text.primary,
    },
  },
  radioGroup: {
    marginTop: theme.spacing(1),
  },
  radioOption: {
    margin: theme.spacing(0.5, 0),
    "& .MuiFormControlLabel-label": {
      fontSize: "0.9rem",
    },
    "& .MuiRadio-root": {
      padding: theme.spacing(0.5),
    },
  },
  select: {
    "& .MuiSelect-select": {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
  },
  inputIcon: {
    fontSize: 20,
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
    verticalAlign: "middle",
  },
  actionButton: {
    height: 48,
    borderRadius: theme.spacing(1),
    fontWeight: 500,
    textTransform: "none",
    fontSize: "1rem",
  },
  primaryButton: {
    height: 56,
    borderRadius: theme.spacing(1),
    fontWeight: 600,
    textTransform: "none",
    fontSize: "1.1rem",
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
    boxShadow: theme.shadows[3],
    "&:hover": {
      boxShadow: theme.shadows[6],
    },
    "&:disabled": {
      background: theme.palette.action.disabledBackground,
    },
  },
}))
