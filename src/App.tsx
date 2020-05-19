import React from "react"
import { CodeNamesGameView } from "./components/CodeNamesGameView"

export const App = () => {
  const urlParams = new URLSearchParams(window.location.search)

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <CodeNamesGameView gameId={urlParams.get("gameId")} />
    </div>
  )
}
