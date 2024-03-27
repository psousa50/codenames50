import * as dotenv from "dotenv"
import { run } from "fp-ts/lib/ReaderTaskEither"
import { configureRoutes, createExpressApp } from "./app/main"
import { config as appConfig } from "./config"
import { DomainEnvironment } from "./domain/adapters"
import { buildEnvironments } from "./environment"
import * as MondoDb from "./mongodb/main"
import { createSocketsApplication, startSocketsApplication } from "./sockets/main"
import { logDebug } from "./utils/debug"

dotenv.config()

const exitProcess = (error: Error) => {
  logDebug("Shutting down app", error.message)
  process.exit(1)
}

const inititialize = async (domainEnvironment: DomainEnvironment) => {
  await run(
    domainEnvironment.repositoriesAdapter.wordsRepositoryPorts.initialize(),
    domainEnvironment.repositoriesAdapter.repositoriesEnvironment,
  )
}

const startApplication = async () => {
  try {
    const config = appConfig.get()

    const mongoUri = process.env.MONGODB_URI || config.mongodb.uri || ""

    const dbClient = await MondoDb.connect(mongoUri)

    const envPort = Number(process.env.PORT)
    const appPort = isNaN(envPort) ? config.port : envPort

    const app = createExpressApp()
    const server = app.listen(appPort)

    const io = createSocketsApplication(server)

    const { domainEnvironment, expressEnvironment, socketsEnvironment } = buildEnvironments(config, dbClient, io)

    configureRoutes(app, expressEnvironment)

    await inititialize(domainEnvironment)

    startSocketsApplication(io, socketsEnvironment)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    exitProcess(err)
  }
}

startApplication().then(
  () => logDebug("App Started"),
  e => logDebug(`Error: ${e.message}`),
)
