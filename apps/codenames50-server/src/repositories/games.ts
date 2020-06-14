import { CodeNamesGame } from "@psousa50/codenames50-core/lib/models"
import { fromPromise } from "../utils/actions"
import { UUID } from "../utils/types"
import { RepositoriesPort } from "./adapters"

const insert: RepositoriesPort<CodeNamesGame, CodeNamesGame> = game =>
  fromPromise(({ mongoAdapter: { gamesMongoDbPorts, mongoEnvironment } }) =>
    gamesMongoDbPorts.insert(mongoEnvironment)(game),
  )

const update: RepositoriesPort<CodeNamesGame, CodeNamesGame> = game =>
  fromPromise(({ mongoAdapter: { gamesMongoDbPorts, mongoEnvironment } }) =>
    gamesMongoDbPorts.update(mongoEnvironment)(game),
  )

const getById: RepositoriesPort<UUID, CodeNamesGame | null> = id =>
  fromPromise(({ mongoAdapter: { gamesMongoDbPorts, mongoEnvironment } }) =>
    gamesMongoDbPorts.getById(mongoEnvironment)(id),
  )

export const gamesRepositoryPorts = {
  insert,
  update,
  getById,
}

export type GamesRepositoryPorts = typeof gamesRepositoryPorts
