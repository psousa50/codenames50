import { CodeNamesGame } from "../domain/models"
import { fromPromise } from "../utils/actions"
import { UUID } from "../utils/types"
import { RepositoriesPort } from "./adapters"

const insert: RepositoriesPort<CodeNamesGame, CodeNamesGame> = game =>
  fromPromise(({ adapters: { gamesMongoDbPorts, mongoEnvironment: { adapters: { dbClient } } } }) =>
    gamesMongoDbPorts.insert(dbClient)(game),
  )

const update: RepositoriesPort<CodeNamesGame, CodeNamesGame> = game =>
  fromPromise(({ adapters: { gamesMongoDbPorts, mongoEnvironment: { adapters: { dbClient } } } }) =>
    gamesMongoDbPorts.update(dbClient)(game),
  )

const getById: RepositoriesPort<UUID, CodeNamesGame | null> = id =>
  fromPromise(({ adapters: { gamesMongoDbPorts, mongoEnvironment: { adapters: { dbClient } } } }) =>
    gamesMongoDbPorts.getById(dbClient)(id),
  )

export const gamesRepositoryPorts = {
  insert,
  update,
  getById,
}

export type GamesRepositoryPorts = typeof gamesRepositoryPorts
