import { pipe } from "fp-ts/lib/pipeable"
import { map, tryCatch } from "fp-ts/lib/TaskEither"
import { MongoClient } from "mongodb"
import { config as appConfig } from "./app/config"
import { AppConfig } from "./app/config"
import { logDebug } from "./utils/debug"
import { gamesRepository, GamesRepository } from "./repositories/games"
import { ServiceError } from "./utils/audit"
import { WordsRepository, wordsRepository } from "./repositories/words"

export type Environment = {
  config: AppConfig
  gamesRepository: GamesRepository
  wordsRepository: WordsRepository
  dbClient: MongoClient
  log: (message: string) => void
}

const connectDb = (mongoUri: string) =>
  tryCatch(
    () => MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true }),
    error => new ServiceError((error as Error).message),
  )

export const buildEnvironment = () => {
  const config = appConfig.get()

  const mongoUri = process.env.MONGODB_URI || config.mongodb.uri || ""
  return pipe(
    connectDb(mongoUri),
    map(mongoClient => ({
      config,
      gamesRepository,
      wordsRepository,
      dbClient: mongoClient,
      log: logDebug,
    })),
  )
}
