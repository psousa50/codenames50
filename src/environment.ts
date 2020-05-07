import { pipe } from "fp-ts/lib/pipeable"
import { map } from "fp-ts/lib/TaskEither"
import { MongoClient } from "mongodb"
import { connect } from "./mongodb/main"
import { config as appConfig } from "./app/config"
import { AppConfig } from "./app/config"
import { logDebug } from "./utils/debug"

export type Environment = {
  config: AppConfig
  dbClient: MongoClient
  log: (message: string) => void
}

export const buildEnvironment = () => {
  const config = appConfig.get()

  const mongoUri = process.env.MONGODB_URI || config.mongodb.uri || ""
  return pipe(
    connect(mongoUri),
    map(mongoClient => ({
      config,
      dbClient: mongoClient,
      log: logDebug,
    })),
  )
}
