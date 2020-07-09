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
} from "@material-ui/core"
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
}

export const SetupGame: React.FC<SetupGameProps> = ({ emitMessage, game, userId }) => {
  const classes = useStyles()

  const gameId = game.gameId

  const [invitePlayersOpened, openInvitePlayers] = React.useState(false)
  const [newGameDialogOpened, setNewGameDialogOpened] = React.useState(false)
  const [config, setConfig] = React.useState(game.config)
  const { languages, turnTimeouts } = useApi()

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

  const changeResponseTimeOut = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as number
    updateConfig({ turnTimeoutSec: value === 0 ? undefined : value })
  }

  const changeLanguage = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string
    updateConfig({ language: value === "" ? undefined : value })
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
    <div className={classes.container}>
      <ConfirmNewGameDialog open={newGameDialogOpened} closeNewGameDialog={closeNewGameDialog} />
      {game.state === GameModels.GameStates.idle && (
        <div>
          <FormControl required className={classes.formControl}>
            <InputLabel id="language">Language</InputLabel>
            <Select labelId="language" value={config.language || ""} onChange={changeLanguage}>
              {languages ? (
                languages.map(l => (
                  <MenuItem key={l} value={l}>
                    <img src={getFlagImage(l)} alt={l} width="30px" style={{ paddingRight: "5px" }} />
                    {l}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value={""} />
              )}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="response-time-out">Time Limit</InputLabel>
            <Select
              labelId="response-time-out"
              value={turnTimeouts ? config.turnTimeoutSec || "0" : ""}
              onChange={changeResponseTimeOut}
            >
              {turnTimeouts ? (
                turnTimeouts.map(tt => (
                  <MenuItem key={tt.timeoutSec} value={tt.timeoutSec}>
                    {tt.description}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value={""} />
              )}
            </Select>
          </FormControl>
        </div>
      )}
      <Teams userId={userId} game={game} joinTeam={joinTeam} setSpyMaster={setSpyMaster} />
      <div className={classes.buttons}>
        <div className={classes.button}>
          <Button
            disabled={!canRandomizeTeams}
            variant="contained"
            size="small"
            color="secondary"
            className={classes.button}
            onClick={() => randomizeTeams()}
          >
            Randomize Team
          </Button>
        </div>
        <div className={classes.button}>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            className={classes.button}
            onClick={() => openInvitePlayers(true)}
          >
            Invite Players
          </Button>
        </div>
      </div>
      <div className={classes.buttons}>
        <div className={classes.button}>
          {game.state === GameModels.GameStates.running ? (
            <Button
              variant="contained"
              size="small"
              color="primary"
              className={classes.button}
              onClick={() => setNewGameDialogOpened(true)}
            >
              New Game
            </Button>
          ) : (
            <Button
              disabled={!canStartGame}
              variant="contained"
              size="small"
              color="primary"
              className={classes.button}
              onClick={() => startGame(config)}
            >
              Start Game
            </Button>
          )}
        </div>
      </div>
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  buttons: {
    width: "100%",
    display: "flex",
    flow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "5px",
  },
}))
