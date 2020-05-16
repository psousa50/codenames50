import { MongoEnvironment } from "../mongodb/adapters"
import { gamesMongoDbPorts, GamesMongoDbPorts } from "../mongodb/games"
import { wordsMongoDbPorts, WordsMongoDbPorts } from "../mongodb/words"
import { Port } from "../utils/adapters"

export type RepositoriesEnvironment = {
  adapters: {
    gamesMongoDbPorts: GamesMongoDbPorts
    wordsMongoDbPorts: WordsMongoDbPorts
    mongoEnvironment: MongoEnvironment
  }
}

export type RepositoriesPort<I = void, R = void> = Port<RepositoriesEnvironment, I, R>

export const buildRepositoriesEnvironment = (mongoEnvironment: MongoEnvironment): RepositoriesEnvironment => ({
  adapters: {
    gamesMongoDbPorts,
    wordsMongoDbPorts,
    mongoEnvironment,
  },
})
