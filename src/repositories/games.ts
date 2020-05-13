import { UUID } from "../utils/types"
import { fromPromise } from "../utils/actions"
import { CodeNamesGame } from "../domain/models"
import { RepositoriesAction } from "./adapters"

const insert: RepositoriesAction<CodeNamesGame, CodeNamesGame> = game =>
  fromPromise(({ adapters: { mongoAdapter } }) =>
    mongoAdapter.gamesMongoDb.insert(game)(mongoAdapter.adapters.dbClient),
  )

const update: RepositoriesAction<CodeNamesGame, CodeNamesGame> = game =>
  fromPromise(({ adapters: { mongoAdapter } }) =>
    mongoAdapter.gamesMongoDb.update(game)(mongoAdapter.adapters.dbClient),
  )

const getById: RepositoriesAction<UUID, CodeNamesGame | null> = id =>
  fromPromise(({ adapters: { mongoAdapter } }) => mongoAdapter.gamesMongoDb.getById(id)(mongoAdapter.adapters.dbClient))

export const gamesRepository = {
  insert,
  update,
  getById,
}

export type GamesRepository = typeof gamesRepository
