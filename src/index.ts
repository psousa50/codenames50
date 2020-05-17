import * as dotenv from "dotenv"
import { MongoClient } from "mongodb"
import { buildExpressEnvironment } from "./app/adapters"
import { createExpressApp } from "./app/main"
import { config as appConfig } from "./config"
import { gamesDomainPorts } from "./domain/games"
import { buildDomainEnvironmentWithRealPorts } from "./environment"
import { gameMessagingPorts } from "./messaging/main"
import { buildSocketsEnvironment } from "./sockets/adapters"
import { createSocketsApplication, startSocketsApplication } from "./sockets/main"
import { logDebug } from "./utils/debug"

dotenv.config()

const exitProcess = (error: Error) => {
  logDebug("Shutting down app", error.message)
  process.exit(1)
}

const startApplication = async () => {
  try {
    const config = appConfig.get()

    const mongoUri = process.env.MONGODB_URI || config.mongodb.uri || ""

    const envPort = Number(process.env.PORT)
    const appPort = isNaN(envPort) ? config.port : envPort

    const socketsPort = appPort + 1
    const io = createSocketsApplication(socketsPort)

    const dbClient = await MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })

    const domainEnvironment = buildDomainEnvironmentWithRealPorts(config, dbClient, io)
    const expressEnvironment = buildExpressEnvironment(config, domainEnvironment, gamesDomainPorts)

    const app = createExpressApp(expressEnvironment)

    const server = app.listen(appPort)

    const socketsEnvironment = buildSocketsEnvironment(
      io,
      domainEnvironment,
      gamesDomainPorts,
      domainEnvironment.gameMessagingAdapter.gameMessagingEnvironment,
      gameMessagingPorts,
    )
    startSocketsApplication(io, socketsEnvironment)

    server.on("checkContinue", (__, res) => {
      res.writeContinue()
    })
    server.once("error", (error: Error) => {
      io.close()
      exitProcess(error)
    })
  } catch (error) {
    exitProcess(error)
  }
}

startApplication().then(
  () => logDebug("App Started"),
  e => logDebug(`Error: ${e.message}`),
)
