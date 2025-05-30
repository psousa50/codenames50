import express, { Express } from "express"
import { createErrorHandler, createNotFoundHandler } from "./handlers"
import { root } from "./routes/root"
import { games } from "./routes/games"
import cors from "cors"
import bodyParser from "body-parser"
import { ExpressEnvironment } from "./adapters"

export const createExpressApp = (allowedOrigins: string[]) => {
  const app: Express = express()

  // Apply CORS only to non-Socket.io routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/socket.io/")) {
      return next()
    }
    cors({
      origin: allowedOrigins,
      credentials: true,
    })(req, res, next)
  })

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  return app
}

export const configureRoutes = (app: Express, environment: ExpressEnvironment) => {
  app.use("/api/v1", root)
  app.use("/api/v1/games", games(environment))
  app.all("*", createNotFoundHandler())
  app.use(createErrorHandler())

  return app
}
