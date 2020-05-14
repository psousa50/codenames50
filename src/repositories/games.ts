import { UUID } from "../utils/types"
import { fromPromise } from "../utils/actions"
import { CodeNamesGame } from "../domain/models"
import { RepositoriesPort } from "./adapters"

const insert: RepositoriesPort<CodeNamesGame, CodeNamesGame> = game =>
  fromPromise(({ adapters: { gamesMongoDb } }) => gamesMongoDb.insert(game))

const update: RepositoriesPort<CodeNamesGame, CodeNamesGame> = game =>
  fromPromise(({ adapters: { gamesMongoDb } }) => gamesMongoDb.update(game))

const getById: RepositoriesPort<UUID, CodeNamesGame | null> = id =>
  fromPromise(({ adapters: { gamesMongoDb } }) => gamesMongoDb.getById(id))

export const gamesRepositoryPorts = {
  insert,
  update,
  getById,
}

export type GamesRepositoryPorts = typeof gamesRepositoryPorts
