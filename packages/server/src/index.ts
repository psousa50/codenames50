import * as dotenv from "dotenv"
import { run } from "fp-ts/lib/ReaderTaskEither"
import { configureRoutes, createExpressApp } from "./app/main"
import { config as appConfig } from "./config"
import { DomainEnvironment } from "./domain/adapters"
import { buildEnvironments } from "./environment"
import * as MondoDb from "./mongodb/main"
import { createSocketsApplication, startSocketsApplication } from "./sockets/main"
import { log } from "./utils/logger"

dotenv.config()

const inititialize = (env: DomainEnvironment) =>
  run(env.repositoriesAdapter.wordsRepositoryPorts.initialize(), env.repositoriesAdapter.repositoriesEnvironment)

const exitProcess = (error: Error) => {
  log.error(error.message, { stack: error.stack })
  process.exit(1)
}

const startApplication = async () => {
  try {
    const config = appConfig.get()

    const mongoUri = process.env.MONGODB_URI || config.mongodb.uri || ""

    const dbClient = await MondoDb.connect(mongoUri)

    const envPort = Number(process.env.PORT)
    const appPort = isNaN(envPort) ? config.port : envPort

    log.info("Server starting with configuration", {
      port: appPort,
      allowedOrigins: config.allowedOrigins,
      nodeEnv: process.env.NODE_ENV,
      logLevel: process.env.LOG_LEVEL || "info",
    })

    const app = createExpressApp(config.allowedOrigins)
    const server = app.listen(appPort)

    const io = createSocketsApplication(server, config.allowedOrigins)

    const { domainEnvironment, expressEnvironment, socketsEnvironment } = buildEnvironments(config, dbClient, io)

    configureRoutes(app, expressEnvironment)

    await inititialize(domainEnvironment)

    startSocketsApplication(io, socketsEnvironment)

    log.info("Server started successfully", { port: appPort })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    exitProcess(err)
  }
}

startApplication().then(
  () => log.info("App initialization completed"),
  e => log.error(`App initialization failed: ${e.message}`, { error: e }),
)
