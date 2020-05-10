import { pipe } from "fp-ts/lib/pipeable"
import { map, tryCatch } from "fp-ts/lib/TaskEither"
import { MongoClient } from "mongodb"
import { config as appConfig } from "./app/config"
import { AppConfig } from "./app/config"
import { logDebug } from "./utils/debug"
import { NewCodeNameGame, CodeNameGame } from "./repositories/games"
import { Repository } from "./repositories/models"
import { gamesRepository } from "./repositories/games"
import { ServiceError } from "./utils/audit"

export type Environment = {
  config: AppConfig
  gamesRepository: Repository<NewCodeNameGame, CodeNameGame>
  dbClient: MongoClient
  log: (message: string) => void
}

const connectDb = (mongoUri: string) =>
  tryCatch(
    () => MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true }),
    error => new ServiceError((error as Error).message),
  )

export const buildEnvironment = () => {
  console.log("1")
  const config = appConfig.get()
  console.log("2")

  const mongoUri = process.env.MONGODB_URI || config.mongodb.uri || ""
  console.log("=====>\n", mongoUri)
  return pipe(
    connectDb(mongoUri),
    map(mongoClient => ({
      config,
      gamesRepository,
      dbClient: mongoClient,
      log: logDebug,
    })),
  )
}
