import { Box } from "@mui/material"
import * as qs from "qs"
import React from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { PlayGameScreen } from "./screens/PlayGame/PlayGameScreen"
import { CreateGameScreen } from "./screens/CreateGame/CreateGameScreen"
import { JoinGameScreen } from "./screens/JoinGame/JoinGameScreen"

export const AppRouter = () => {
  const location = useLocation()

  const search = qs.parse(location.search, { ignoreQueryPrefix: true })

  const userId = search.userId?.toString()
  const gameId = search.gameId?.toString()

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100vw",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Routes>
        <Route path="/" element={<CreateGameScreen userId={userId} />} />
        <Route
          path="/join"
          element={gameId ? <JoinGameScreen gameId={gameId} userId={userId || ""} /> : <div>No gameId provided</div>}
        />
        <Route
          path="/game"
          element={
            gameId && userId ? <PlayGameScreen gameId={gameId} userId={userId} /> : <div>Missing gameId or userId</div>
          }
        />
      </Routes>
    </Box>
  )
}
