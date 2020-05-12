import React from "react"
import { CodeNamesView } from "./components/CodeNamesGameView"

export const App = () => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <CodeNamesView />
      <CodeNamesView />
    </div>
  )
}
