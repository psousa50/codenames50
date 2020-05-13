import express, { Express } from "express"
import { createErrorHandler, createNotFoundHandler } from "./handlers"
import { root } from "./routes/root"
import { games } from "./routes/games"
import cors from "cors"
import bodyParser from "body-parser"
import { ExpressAdapter } from "./adapters"

export const createExpressApp = (environment: ExpressAdapter) => {
  const app: Express = express()

  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use("/api/v1", root)
  app.use("/api/v1/games", games(environment))
  app.all("*", createNotFoundHandler())
  app.use(createErrorHandler())

  return app
}
