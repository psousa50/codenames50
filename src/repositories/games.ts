import { UUID } from "../utils/types"
import { Action, fromPromise, fromVoidPromise } from "../utils/actions"
import * as MongoGames from "../mongodb/games"
import { CodeNameGame } from "../domain/models"

const insert: Action<CodeNameGame, UUID> = game => fromPromise(env => MongoGames.insert(game)(env.dbClient))

const update: Action<CodeNameGame, void> = game => fromVoidPromise(env => MongoGames.update(game)(env.dbClient))

const getById: Action<UUID, CodeNameGame | null> = id => fromPromise(env => MongoGames.getById(id)(env.dbClient))

export const gamesRepository = {
  insert,
  update,
  getById,
}

export type GamesRepository = typeof gamesRepository
