import { GameModels } from "@codenames50/core"
import { fromPromise } from "../utils/actions"
import { UUID } from "../utils/types"
import { RepositoriesPort } from "./adapters"

const insert: RepositoriesPort<GameModels.CodeNamesGame, GameModels.CodeNamesGame> = game =>
  fromPromise(({ mongoAdapter: { gamesMongoDbPorts, mongoEnvironment } }) =>
    gamesMongoDbPorts.insert(mongoEnvironment)(game),
  )

const update: RepositoriesPort<GameModels.CodeNamesGame, GameModels.CodeNamesGame> = game =>
  fromPromise(({ mongoAdapter: { gamesMongoDbPorts, mongoEnvironment } }) =>
    gamesMongoDbPorts.update(mongoEnvironment)(game),
  )

const getById: RepositoriesPort<UUID, GameModels.CodeNamesGame | null> = id =>
  fromPromise(({ mongoAdapter: { gamesMongoDbPorts, mongoEnvironment } }) =>
    gamesMongoDbPorts.getById(mongoEnvironment)(id),
  )

export const gamesRepositoryPorts = {
  insert,
  update,
  getById,
}

export type GamesRepositoryPorts = typeof gamesRepositoryPorts
