import { v4 as uuidv4 } from "uuid"
import { MongoClient } from "mongodb"
import { config as appConfig } from "./app/config"
import { currentUtcDateTime } from "./utils/dates"
import { gamesRepository } from "./repositories/games"
import { wordsRepository } from "./repositories/words"
import { gamesDomain } from "./domain/games"
import { RepositoriesAdapter } from "./repositories/adapters"
import { MongoAdapter } from "./mongodb/adapters"
import { gamesMongoDb } from "./mongodb/games"
import { wordsMongoDb } from "./mongodb/words"
import { DomainAdapter } from "./domain/adapters"
import { ExpressAdapter } from "./app/adapters"

export const buildExpressAdapter = async () => {
  const config = appConfig.get()

  const mongoUri = process.env.MONGODB_URI || config.mongodb.uri || ""

  const dbClient = await MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })

  const mongoAdapter: MongoAdapter = {
    gamesMongoDb,
    wordsMongoDb,
    adapters: {
      dbClient,
    },
  }

  const repositoriesAdapter: RepositoriesAdapter = {
    gamesRepository,
    wordsRepository,
    adapters: {
      mongoAdapter,
    },
  }

  const domainAdapter: DomainAdapter = {
    config: {
      boardWidth: config.boardWidth,
      boardHeight: config.boardHeight,
    },
    gamesDomain,
    adapters: {
      repositories: repositoriesAdapter,
      uuid: uuidv4,
      currentUtcDateTime,
    },
  }

  const expressAdapter: ExpressAdapter = {
    config: {
      port: config.port,
    },
    adapters: {
      domain: domainAdapter,
    },
  }

  return expressAdapter
}
