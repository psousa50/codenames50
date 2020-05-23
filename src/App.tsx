import * as qs from "qs"
import React from "react"
import { Route, Switch, useLocation } from "react-router-dom"
import { CodeNamesGameView } from "./components/CodeNamesGameView"
import { CreateGameView } from "./components/CreateGameView"

export const App = () => {
  const location = useLocation()

  const search = qs.parse(location.search, { ignoreQueryPrefix: true })

  const userId = search.userId?.toString()
  const gameId = search.gameId?.toString()

  console.log("ROUTER=====>", gameId, userId)

  return (
    <Switch>
      <Route path="/" exact>
        <CreateGameView userId={userId} />
      </Route>
      <Route path="/game">
        <CodeNamesGameView gameId={gameId!} userId={userId!} />
      </Route>
    </Switch>
  )
}
