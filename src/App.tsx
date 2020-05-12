import React from "react"
import { CodeNamesGameView } from "./components/CodeNamesGameView"

export const App = () => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <CodeNamesGameView />
    </div>
  )
}
