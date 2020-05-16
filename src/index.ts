import * as dotenv from "dotenv"
import express from "express"
import { MongoClient } from "mongodb"
import socketIo from "socket.io"
import { buildExpressEnvironment } from "./app/adapters"
import { createExpressApp } from "./app/main"
import { config as appConfig } from "./config"
import { buildDomainEnvironment } from "./domain/adapters"
import { buildGameMessagingEnvironment } from "./messaging/adapters"
import { buildMessengerEnvironment } from "./messaging/messenger"
import { buildMongoEnvironment } from "./mongodb/adapters"
import { buildRepositoriesEnvironment } from "./repositories/adapters"
import { buildSocketsEnvironment } from "./sockets/adapters"
import { socketHandler } from "./sockets/handlers"
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

    const dbClient = await MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    const socketsPort = appPort + 1
    const appSocket = express()
    const server2 = appSocket.listen(socketsPort)
    const io = socketIo(server2, {})

    const mongoEnvironment = buildMongoEnvironment(dbClient)
    const repositoriesEnvironment = buildRepositoriesEnvironment(mongoEnvironment)
    const messengerEnvironment = buildMessengerEnvironment(io)
    const gameMessagingEnvironment = buildGameMessagingEnvironment(messengerEnvironment)
    const domainEnvironment = buildDomainEnvironment(config, repositoriesEnvironment, gameMessagingEnvironment)
    const expressEnvironment = buildExpressEnvironment(config, domainEnvironment)

    const app = createExpressApp(expressEnvironment)

    const server = app.listen(appPort)

    const socketsEnvironment = buildSocketsEnvironment(io, domainEnvironment, gameMessagingEnvironment)
    io.on("connection", socketHandler(socketsEnvironment))

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
