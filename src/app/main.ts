import express, { Express } from "express"
import socketIo from "socket.io"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromTaskEither, map } from "fp-ts/lib/ReaderTaskEither"
import { tryCatch } from "fp-ts/lib/TaskEither"
import { Server } from "http"
import { Action, ask } from "../utils/actions"
import { logDebug } from "../utils/debug"
import { createErrorHandler, createNotFoundHandler } from "./handlers"
import { Environment } from "../environment"
import { root } from "./routes/root"
import { games } from "./routes/games"
import cors from "cors"
import bodyParser from "body-parser"
import { socketHandler } from "./sockets/handler"

export const expressApp = (environment: Environment) => {
  const app: Express = express()

  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use("/api/v1", root(environment))
  app.use("/api/v1/games", games(environment))
  app.all("*", createNotFoundHandler())
  app.use(createErrorHandler())

  return app
}

export const createApplication: Action<void, Express> = () => pipe(ask(), map(expressApp))

export const runServer: Action<Express, Server> = app =>
  pipe(
    ask(),
    chain(env =>
      fromTaskEither(
        tryCatch(
          () =>
            new Promise<Server>((resolve, reject) => {
              try {
                const port = process.env.PORT || env.config.port
                const server: Server = app.listen(port, () => {
                  logDebug(`Server started, listening at ${port}...`)
                  return resolve(server)
                })

                const io = socketIo(server, {})
                io.on("connection", socketHandler(env, io))

                server.on("checkContinue", (__, res) => {
                  res.writeContinue()
                })
                server.once("error", (err: Error) => {
                  io.close()
                  return reject(err)
                })
              } catch (err) {
                reject(err)
              }
            }),
          (e: any) => e,
        ),
      ),
    ),
  )

export const application: Action<void, Server> = () => pipe(createApplication(), chain(runServer))
