import * as dotenv from "dotenv"
import { logDebug } from "./utils/debug"
import { config as appConfig } from "./config"
import { buildMongoEnvironment } from "./mongodb/adapters"
import { buildDomainEnvironment } from "./domain/adapters"
import { buildRepositoriesEnvironment } from "./repositories/adapters"
import { MongoClient } from "mongodb"
import { createSocketApp } from "./sockets/main"
import { createExpressApp } from "./app/main"
import { buildExpressEnvironment } from "./app/adapters"

dotenv.config()

const exitProcess = (error: Error) => {
  logDebug("Shutting down app", error.message)
  process.exit(1)
}

const startApplication = async () => {
  try {
    const config = appConfig.get()

    const mongoUri = process.env.MONGODB_URI || config.mongodb.uri || ""

    const dbClient = await MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    const mongoEnvironment = buildMongoEnvironment(dbClient)
    const repositoriesEnvironment = buildRepositoriesEnvironment(mongoEnvironment)
    const domainEnvironment = buildDomainEnvironment(config, repositoriesEnvironment)
    const expressEnvironment = buildExpressEnvironment(config, domainEnvironment)

    const app = createExpressApp(expressEnvironment)

    const envPort = Number(process.env.PORT)
    const port = isNaN(envPort) ? expressEnvironment.config.port : envPort
    const server = app.listen(port)

    const io = createSocketApp(app, port + 1, domainEnvironment)

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
