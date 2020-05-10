import { UUID } from "../utils/types"
import { Action, fromPromise, fromVoidPromise } from "../utils/actions"
import * as MongoGames from "../mongodb/games"

export enum Teams {
  red = "red",
  blue = "blue",
}

export enum GameStates {
  idle = "idle",
  running = "running",
  ended = "ended",
}

export interface NewCodeNameGame {
  userId: string
  players: Player[]
  state: GameStates
  turn: Teams
  words: string[]
}

export interface CodeNameGame extends NewCodeNameGame {
  gameId: string
  timestamp: string
}

interface Player {
  userId: string
}
const insert: Action<CodeNameGame, UUID> = game => fromPromise(env => MongoGames.insert(game)(env.dbClient))

const update: Action<CodeNameGame, void> = game => fromVoidPromise(env => MongoGames.update(game)(env.dbClient))

const getById: Action<UUID, CodeNameGame | null> = id => fromPromise(env => MongoGames.getById(id)(env.dbClient))

export const gamesRepository = {
  insert,
  update,
  getById,
}

export type GamesRepository = typeof gamesRepository
