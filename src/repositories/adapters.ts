import * as Actions from "../utils/actions"
import { MongoAdapter } from "../mongodb/adapters"
import { GamesRepository } from "./games"
import { WordsRepository } from "./words"
import { ServiceError } from "../utils/audit"

export type RepositoriesAdapter = {
  gamesRepository: GamesRepository
  wordsRepository: WordsRepository
  adapters: {
    mongoAdapter: MongoAdapter
  }
}

export type RepositoriesActionResult<R = void> = Actions.ActionResult<RepositoriesAdapter, R>
export type RepositoriesAction<I = void, R = void> = Actions.Action<RepositoriesAdapter, I, R>

export function ask() {
  return Actions.ask<RepositoriesAdapter>()
}

export const actionOf = <R>(v: R) => Actions.actionOf<RepositoriesAdapter, R>(v)
export const actionErrorOf = <R>(error: ServiceError) => Actions.actionErrorOf<RepositoriesAdapter, R>(error)

export const withEnv = <R>(f: (env: RepositoriesAdapter) => RepositoriesActionResult<R>) =>
  Actions.withEnv<RepositoriesAdapter, R>(f)
