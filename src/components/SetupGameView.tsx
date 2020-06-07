import { Button, FormControl, InputLabel, makeStyles, MenuItem, Select, Theme } from "@material-ui/core"
import React from "react"
import { CodeNamesGame, GameConfig, GameStates, Teams } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { InvitePlayersDialog } from "./InvitePlayersDialog"
import { TeamsView } from "./TeamsView"

const enImage = require("../assets/images/en.png")
const ptImage = require("../assets/images/pt.png")

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

interface SetupGameViewProps {
  userId: string
  game: CodeNamesGame
  joinTeam: (team: Teams) => void
  setSpyMaster: (team: Teams) => void
  randomizeTeams: () => void
  startGame: (config: GameConfig) => void
}

export const SetupGameView: React.FC<SetupGameViewProps> = ({
  userId,
  game,
  joinTeam,
  setSpyMaster,
  randomizeTeams,
  startGame,
}) => {
  const classes = useStyles()

  const [invitePlayersOpened, openInvitePlayers] = React.useState(false)
  const [config, setConfig] = React.useState(game.config)

  React.useEffect(() => {
    setConfig(game.config)
  }, [game.config])

  const changeResponseTimeOut = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as number
    setConfig(c => ({ ...c, responseTimeoutSec: value === 0 ? undefined : value }))
  }

  const changeLanguage = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string
    setConfig(c => ({ ...c, language: value === "" ? undefined : value }))
  }

  const canStartGame = GameRules.startGame(config)(game) === undefined
  const canRandomizeTeams = GameRules.randomizeTeams(game) === undefined

  return (
    <div className={classes.container}>
      {game.state === GameStates.idle && (
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
            </Select>
          </FormControl>
        </div>
      )}
      <TeamsView userId={userId} game={game} joinTeam={joinTeam} setSpyMaster={setSpyMaster} />
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
        </div>
      </div>
      <InvitePlayersDialog onClose={() => openInvitePlayers(false)} open={invitePlayersOpened} gameId={game.gameId} />
    </div>
  )
}
