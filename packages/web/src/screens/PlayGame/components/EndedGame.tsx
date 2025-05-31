import { GameModels } from "@codenames50/core"
import { Button, Box } from "@mui/material"
import React from "react"
import { teamName } from "../../../utils/ui"
import { WordsBoard } from "./WordsBoard"
import { WordsLeft } from "./WordsLeft"

interface EndedGameProps {
  userId: string
  game: GameModels.CodeNamesGame
  newGame: () => void
}

export const EndedGame: React.FC<EndedGameProps> = ({ userId, game, newGame }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 10px",
      }}
    >
      <WordsLeft game={game} text={`${teamName(game.winner)} Wins!`} team={game.winner} />
      <Box sx={{ marginTop: "20px" }} />
      <WordsBoard userId={userId} game={game} board={game.board} revealWords={true} />
      <Box sx={{ marginTop: "20px" }} />
      <Button variant="contained" size="small" color="primary" onClick={() => newGame()}>
        New Game
      </Button>
    </Box>
  )
}
