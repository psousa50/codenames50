import { MongoEnvironment } from "../mongodb/adapters"
import { GamesMongoDbPorts } from "../mongodb/games"
import { WordsMongoDbPorts } from "../mongodb/words"
import { Port } from "../utils/adapters"

export type RepositoriesPort<I = void, R = void> = Port<RepositoriesEnvironment, I, R>

export const buildRepositoriesEnvironment = (
  mongoEnvironment: MongoEnvironment,
  gamesMongoDbPorts: GamesMongoDbPorts,
  wordsMongoDbPorts: WordsMongoDbPorts,
) => ({
  mongoAdapter: {
    mongoEnvironment,
    gamesMongoDbPorts,
    wordsMongoDbPorts,
  },
})

export type RepositoriesEnvironment = ReturnType<typeof buildRepositoriesEnvironment>
