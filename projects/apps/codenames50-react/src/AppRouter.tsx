import { makeStyles, Theme } from "@material-ui/core"
import * as qs from "qs"
import React from "react"
import { Route, Switch, useLocation } from "react-router-dom"
import { CodeNamesGameLoader } from "./views/CodeNamesGame/CodeNamesGameLoader"
import { CreateGameView } from "./views/CreateGameView"
import { JoinGameView } from "./views/JoinGameView"

const useStyles = makeStyles((theme: Theme) => ({
  app: {
    display: "flex",
    flex: 1,
    width: "100vw",
    alignItems: "center",
    flexDirection: "column",
  },
}))

export const AppRouter = () => {
  const classes = useStyles()

  const location = useLocation()

  const search = qs.parse(location.search, { ignoreQueryPrefix: true })

  const userId = search.userId?.toString()
  const gameId = search.gameId?.toString()

  return (
    <div className={classes.app}>
      <Switch>
        <Route path="/" exact>
          <CreateGameView userId={userId} />
        </Route>
        <Route path="/join">{gameId && <JoinGameView gameId={gameId} userId={userId || ""} />}</Route>
        <Route path="/game">{gameId && userId && <CodeNamesGameLoader gameId={gameId} userId={userId} />}</Route>
      </Switch>
    </div>
  )
}
