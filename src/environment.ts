import { v4 as uuidv4 } from "uuid"
import moment from "moment"
import { pipe } from "fp-ts/lib/pipeable"
import { map, tryCatch } from "fp-ts/lib/TaskEither"
import { MongoClient } from "mongodb"
import { config as appConfig } from "./app/config"
import { AppConfig } from "./app/config"
import { logDebug } from "./utils/debug"
import { currentUtcDateTime } from "./utils/dates"
import { gamesRepository, GamesRepository } from "./repositories/games"
import { ServiceError } from "./utils/audit"
import { WordsRepository, wordsRepository } from "./repositories/words"
import { gamesDomain, GamesDomain } from "./domain/games"

export type Environment = {
  config: AppConfig
  gamesRepository: GamesRepository
  wordsRepository: WordsRepository
  gamesDomain: GamesDomain
  dbClient: MongoClient
  uuid: () => string
  currentUtcDateTime: () => moment.Moment
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
      gamesDomain,
      dbClient: mongoClient,
      log: logDebug,
      uuid: uuidv4,
      currentUtcDateTime,
    })),
  )
}
