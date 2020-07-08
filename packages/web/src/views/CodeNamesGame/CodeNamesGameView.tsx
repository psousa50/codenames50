import { Accordion, AccordionDetails, AccordionSummary, Snackbar, Typography } from "@material-ui/core"
import { makeStyles, Theme } from "@material-ui/core/styles"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { Alert, AlertTitle } from "@material-ui/lab"
import { GameModels } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import React from "react"
import { EmitMessage } from "../../utils/types"
import { EndedGameView } from "./components/EndedGame"
import { Header } from "./components/Header"
import { RunningGame } from "./components/RunningGame"
import { SetupGame } from "./components/SetupGame"

export interface CodeNamesGameViewProps {
  emitMessage: EmitMessage
  error: string
  game: GameModels.CodeNamesGame
  userId: string
  clearError: () => void
}

const Separator = () => <div style={{ height: "1rem" }}></div>

export const CodeNamesGameView: React.FC<CodeNamesGameViewProps> = ({
  emitMessage,
  error,
  game,
  userId,
  clearError,
}) => {
  const classes = useStyles()

  const [teamsExpanded, setTeamsExpanded] = React.useState(false)

  const gameId = game.gameId

  const restartGame = () => {
    emitMessage(Messages.restartGame({ gameId, userId }))
  }

  React.useEffect(() => {
    setTeamsExpanded(game.state === GameModels.GameStates.idle)
  }, [game.state])

  const handleTeamsExpanded = (_: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setTeamsExpanded(isExpanded)
  }

  return (
    <div className={classes.container}>
      <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={clearError}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>

      <div className={classes.game}>
        <Header game={game} userId={userId} />

        <Separator />

        <SetupGameAcordion
          teamsExpanded={teamsExpanded}
          handleTeamsExpanded={handleTeamsExpanded}
          emitMessage={emitMessage}
          game={game}
          userId={userId}
        />

        <Separator />

        {game.state === GameModels.GameStates.running && (
          <RunningGame game={game} userId={userId} emitMessage={emitMessage} />
        )}

        {game.state === GameModels.GameStates.ended && (
          <EndedGameView userId={userId} game={game} newGame={restartGame} />
        )}
      </div>
    </div>
  )
}

interface SetupGameAcordionProps {
  teamsExpanded: boolean
  handleTeamsExpanded: (_: React.ChangeEvent<{}>, isExpanded: boolean) => void
  emitMessage: EmitMessage
  game: GameModels.CodeNamesGame
  userId: string
}

const SetupGameAcordion: React.FC<SetupGameAcordionProps> = ({
  teamsExpanded,
  handleTeamsExpanded,
  emitMessage,
  game,
  userId,
}) => {
  const classes = useStyles()

  return (
    <div className={classes.teams}>
      <Accordion expanded={teamsExpanded} onChange={handleTeamsExpanded}>
        <AccordionSummary
          classes={{
            root: classes.expandableRoot,
            content: classes.expandableContent,
          }}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>Game Setup</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SetupGame emitMessage={emitMessage} game={game} userId={userId} />
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  game: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px",
  },
  expandableRoot: {
    padding: 0,
    minHeight: "0.5rem",
  },
  expandableContent: {
    margin: 0,
    padding: 0,
    justifyContent: "center",
  },
  teams: {
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
  heading: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.secondary.main,
  },
}))
