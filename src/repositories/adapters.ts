import { MongoEnvironment } from "../mongodb/adapters"
import { gamesMongoDbPorts } from "../mongodb/games"
import { wordsMongoDbPorts } from "../mongodb/words"
import { Port } from "../utils/adapters"

export type RepositoriesPort<I = void, R = void> = Port<RepositoriesEnvironment, I, R>

export const buildRepositoriesEnvironment = (mongoEnvironment: MongoEnvironment) => ({
  mongoAdapter: {
    gamesMongoDbPorts,
    wordsMongoDbPorts,
    mongoEnvironment,
  },
})

export type RepositoriesEnvironment = ReturnType<typeof buildRepositoriesEnvironment>
