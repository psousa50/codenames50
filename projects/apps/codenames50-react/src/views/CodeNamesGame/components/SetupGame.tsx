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
import * as Models from "codenames50-core/lib/models"
import * as GameRules from "codenames50-core/lib/rules"
import * as Messages from "codenames50-messaging/lib/messages"
import React from "react"
import { InvitePlayersDialog } from "./InvitePlayersDialog"
import { Teams } from "./Teams"
import { EmitMessage } from "../../../utils/types"

const enImage = require("../../../assets/images/en.png")
const ptImage = require("../../../assets/images/pt.png")

interface SetupGameProps {
  emitMessage: EmitMessage
  game: Models.CodeNamesGame
  userId: string
}

export const SetupGame: React.FC<SetupGameProps> = ({ emitMessage, game, userId }) => {
  const classes = useStyles()

  const gameId = game.gameId

  const [invitePlayersOpened, openInvitePlayers] = React.useState(false)
  const [newGameDialogOpened, setNewGameDialogOpened] = React.useState(false)
  const [config, setConfig] = React.useState(game.config)

  React.useEffect(() => {
    setConfig(game.config)
  }, [game.config])

  const restartGame = () => {
    emitMessage(Messages.restartGame({ gameId, userId }))
  }

  const setSpyMaster = (team: Models.Teams) => {
    emitMessage(Messages.setSpyMaster({ gameId, userId, team }))
  }

  const joinTeam = (team: Models.Teams) => {
    emitMessage(Messages.joinTeam({ gameId, userId, team }))
  }

  const updateConfig = (config: Partial<Models.GameConfig>) => {
    setConfig(c => {
      const newConfig = { ...c, ...config }
      emitMessage(Messages.updateConfig({ gameId: game.gameId, userId, config: newConfig }))
      return newConfig
    })
  }

  const changeResponseTimeOut = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as number
    updateConfig({ responseTimeoutSec: value === 0 ? undefined : value })
  }

  const changeLanguage = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string
    updateConfig({ language: value === "" ? undefined : value })
  }

  const randomizeTeams = () => {
    emitMessage(Messages.randomizeTeam({ gameId }))
  }

  const startGame = (config: Models.GameConfig) => {
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
      {game.state === Models.GameStates.idle && (
        <div>
          <FormControl required className={classes.formControl}>
            <InputLabel id="language">Language</InputLabel>
            <Select labelId="language" value={config.language || ""} onChange={changeLanguage}>
              <MenuItem value={"en"}>
                <img src={enImage} alt="en" width="30px" style={{ paddingLeft: "5px" }} />
              </MenuItem>
              <MenuItem value={"pt"}>
                <img src={ptImage} alt="pt" width="30px" style={{ paddingLeft: "5px" }} />
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="response-time-out">Time Limit</InputLabel>
            <Select labelId="response-time-out" value={config.responseTimeoutSec || 0} onChange={changeResponseTimeOut}>
              <MenuItem value={0}>
                <em>No limit</em>
              </MenuItem>
              <MenuItem value={60}>1 minute</MenuItem>
              <MenuItem value={120}>2 minutes</MenuItem>
              <MenuItem value={180}>3 minutes</MenuItem>
              <MenuItem value={300}>5 minutes</MenuItem>
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
          {game.state === Models.GameStates.running ? (
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
