import * as dotenv from "dotenv"
import { logDebug } from "./utils/debug"
import { createExpressApp } from "./app/main"
import { buildExpressAdapter } from "./app/adapters"
import { config as appConfig } from "./config"
import { buildMongoAdapter } from "./mongodb/adapters"
import { buildDomainAdapter } from "./domain/adapters"
import { buildRepositoriesAdapter } from "./repositories/adapters"
import { MongoClient } from "mongodb"
import { createSocketApp } from "./app/sockets/main"

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
    const mongoAdapter = buildMongoAdapter(dbClient)
    const repositoriesAdapter = buildRepositoriesAdapter(mongoAdapter)
    const domainAdapter = buildDomainAdapter(config, repositoriesAdapter)
    const expressAdapter = buildExpressAdapter(config, domainAdapter)

    const app = createExpressApp(expressAdapter)

    const envPort = Number(process.env.PORT)
    const port = isNaN(envPort) ? expressAdapter.config.port : envPort
    const server = app.listen(port)

    const io = createSocketApp(app, port + 1, domainAdapter)

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
