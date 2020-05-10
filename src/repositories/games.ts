import { UUID } from "../utils/types"
import { Action, fromPromise } from "../utils/actions"
import * as MongoGames from "../mongodb/games"

export interface NewCodeNameGame {
  userId: string
}

export interface CodeNameGame extends NewCodeNameGame {
  gameId: string
}

const insert: Action<NewCodeNameGame, UUID> = game => fromPromise(env => MongoGames.insert(game)(env.dbClient))

const getById: Action<UUID, CodeNameGame | null> = id => fromPromise(env => MongoGames.getById(id)(env.dbClient))

export const gamesRepository = {
  insert,
  getById,
}
