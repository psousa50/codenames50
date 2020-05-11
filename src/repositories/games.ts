import { UUID } from "../utils/types"
import { Action, fromPromise } from "../utils/actions"
import * as MongoGames from "../mongodb/games"
import { CodeNamesGame } from "../domain/models"

const insert: Action<CodeNamesGame, CodeNamesGame> = game => fromPromise(env => MongoGames.insert(game)(env.dbClient))

const update: Action<CodeNamesGame, CodeNamesGame> = game => fromPromise(env => MongoGames.update(game)(env.dbClient))

const getById: Action<UUID, CodeNamesGame | null> = id => fromPromise(env => MongoGames.getById(id)(env.dbClient))

export const gamesRepository = {
  insert,
  update,
  getById,
}

export type GamesRepository = typeof gamesRepository
