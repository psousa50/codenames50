import React from "react"
import * as uuid from "uuid"
import { CodeNamesGameView } from "./components/CodeNamesGameView"

export const App = () => {
  const urlParams = new URLSearchParams(window.location.search)

  const gameId = uuid.v4()
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <CodeNamesGameView gameId={urlParams.get("gameId") || gameId} userId={urlParams.get("userId")} />
    </div>
  )
}
