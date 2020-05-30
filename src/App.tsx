import { makeStyles, Theme } from "@material-ui/core"
import * as qs from "qs"
import React from "react"
import { Route, Switch, useLocation } from "react-router-dom"
import { CodeNamesGameView } from "./components/CodeNamesGameView"
import { CreateGameView } from "./components/CreateGameView"
import { JoinGameView } from "./components/JoinGameView"

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flex: 1,
  },
}))

export const App = () => {
  const classes = useStyles()

  const location = useLocation()

  const search = qs.parse(location.search, { ignoreQueryPrefix: true })

  const userId = search.userId?.toString()
  const gameId = search.gameId?.toString()

  return (
    <div className={classes.container}>
      <Switch>
        <Route path="/" exact>
          <CreateGameView userId={userId} />
        </Route>
        <Route path="/join">
          <JoinGameView gameId={gameId} userId={userId} />
        </Route>
        <Route path="/game">
          <CodeNamesGameView gameId={gameId!} userId={userId!} />
        </Route>
      </Switch>
    </div>
  )
}
