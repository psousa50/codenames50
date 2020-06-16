import cors from "cors"
import * as dotenv from "dotenv"
import { buildExpressEnvironment } from "./app/adapters"
import { createExpressApp } from "./app/main"
import { config as appConfig } from "./config"
import { gamesDomainPorts } from "./domain/main"
import { buildDomainEnvironmentWithRealPorts } from "./environment"
import { gameMessagingPorts } from "./messaging/main"
import * as MondoDb from "./mongodb/main"
import { buildSocketsEnvironment } from "./sockets/adapters"
import { createSocketsApplication, startSocketsApplication } from "./sockets/main"
import { logDebug } from "./utils/debug"
import { DomainEnvironment } from "./domain/adapters"
import { run } from "fp-ts/lib/ReaderTaskEither"

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

    const socketsPort = appPort
    const io = createSocketsApplication(socketsPort)

    const dbClient = await MondoDb.connect(mongoUri)

    const domainEnvironment = buildDomainEnvironmentWithRealPorts(config, dbClient, io)
    const expressEnvironment = buildExpressEnvironment(config, domainEnvironment, gamesDomainPorts)

    const app = createExpressApp(expressEnvironment)
    app.use(cors())

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
