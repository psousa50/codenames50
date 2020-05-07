import express, { Express } from "express"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromTaskEither, map } from "fp-ts/lib/ReaderTaskEither"
import { tryCatch } from "fp-ts/lib/TaskEither"
import { Server } from "http"
import { Action, ask } from "../utils/actions"
import { logDebug } from "../utils/debug"
import { createErrorHandler, createNotFoundHandler } from "./errorHandler"
import { router as v1Router } from "./routes/v1/router"
import { Environment } from "../environment"

export const expressApp = (environment: Environment) => {
  const app: Express = express()
  app.use("/api/v1", v1Router(environment))
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
                server.on("checkContinue", (__, res) => {
                  res.writeContinue()
                })
                server.once("error", (err: Error) => {
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
