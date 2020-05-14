import * as Actions from "../utils/actions"
import { ServiceError } from "../utils/audit"
import { Port } from "../utils/adapters"
import { gamesMongoDbPorts } from "../mongodb/games"
import { wordsMongoDbPorts } from "../mongodb/words"
import { MongoEnvironment } from "../mongodb/adapters"
import { CodeNamesGame, Words } from "../domain/models"
import { UUID } from "../utils/types"

export type RepositoriesEnvironment = {
  adapters: {
    gamesMongoDb: {
      insert: (game: CodeNamesGame) => Promise<CodeNamesGame>
      update: (game: CodeNamesGame) => Promise<CodeNamesGame>
      getById: (gameId: UUID) => Promise<CodeNamesGame | null>
    }
    wordsMongoDb: {
      insert: (words: Words) => Promise<void>
      getByLanguage: (language: string) => Promise<Words | null>
    }
  }
}

export type RepositoriesActionResult<R = void> = Actions.ActionResult<RepositoriesEnvironment, R>
export type RepositoriesPort<I = void, R = void> = Port<RepositoriesEnvironment, I, R>

export function ask() {
  return Actions.ask<RepositoriesEnvironment>()
}

export const actionOf = <R>(v: R) => Actions.actionOf<RepositoriesEnvironment, R>(v)
export const actionErrorOf = <R>(error: ServiceError) => Actions.actionErrorOf<RepositoriesEnvironment, R>(error)

export const withEnv = <R>(f: (env: RepositoriesEnvironment) => RepositoriesActionResult<R>) =>
  Actions.withEnv<RepositoriesEnvironment, R>(f)

export const buildRepositoriesEnvironment = (mongoEnvironment: MongoEnvironment): RepositoriesEnvironment => ({
  adapters: {
    gamesMongoDb: {
      insert: gamesMongoDbPorts.insert(mongoEnvironment.adapters.dbClient),
      update: gamesMongoDbPorts.update(mongoEnvironment.adapters.dbClient),
      getById: gamesMongoDbPorts.getById(mongoEnvironment.adapters.dbClient),
    },
    wordsMongoDb: {
      insert: wordsMongoDbPorts.insert(mongoEnvironment.adapters.dbClient),
      getByLanguage: wordsMongoDbPorts.getByLanguage(mongoEnvironment.adapters.dbClient),
    },
  },
})
