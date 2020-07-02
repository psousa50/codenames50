import * as dotenv from "dotenv"
import { run } from "fp-ts/lib/ReaderTaskEither"
import { buildExpressEnvironment } from "./app/adapters"
import { createExpressApp, setupRoutes as configureRoutes } from "./app/main"
import { config as appConfig } from "./config"
import { DomainEnvironment } from "./domain/adapters"
import { gamesDomainPorts } from "./domain/main"
import { buildDomainEnvironmentForExternalServices } from "./environment"
import { gameMessagingPorts } from "./messaging/main"
import * as MondoDb from "./mongodb/main"
import { buildSocketsEnvironment } from "./sockets/adapters"
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

    const envPort = Number(process.env.PORT)
    const appPort = isNaN(envPort) ? config.port : envPort

    const app = createExpressApp()
    const server = app.listen(appPort)

    const io = createSocketsApplication(server)

    const dbClient = await MondoDb.connect(mongoUri)

    const domainEnvironment = buildDomainEnvironmentForExternalServices(config, dbClient, io)
    const expressEnvironment = buildExpressEnvironment(config, domainEnvironment, gamesDomainPorts)

    configureRoutes(app, expressEnvironment)

    const socketsEnvironment = buildSocketsEnvironment(
      io,
      domainEnvironment,
      gamesDomainPorts,
      domainEnvironment.gameMessagingAdapter.gameMessagingEnvironment,
      gameMessagingPorts,
    )

    await inititialize(domainEnvironment)

    startSocketsApplication(io, socketsEnvironment)
  } catch (error) {
    exitProcess(error)
  }
}

startApplication().then(
  () => logDebug("App Started"),
  e => logDebug(`Error: ${e.message}`),
)
