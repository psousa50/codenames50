import moment from "moment"

import { RepositoriesAdapter } from "../repositories/adapters"
import { ActionResult, Action, ask as askAction } from "../utils/actions"
import { right, left } from "fp-ts/lib/Either"
import { ServiceError } from "../utils/audit"
import { pipe } from "fp-ts/lib/pipeable"
import { fromEither, chain, fromTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { TaskEither } from "fp-ts/lib/TaskEither"
import { AppConfig } from "../config"
import { v4 as uuidv4 } from "uuid"
import { currentUtcDateTime } from "../utils/dates"
import { gamesRepository, GamesRepository } from "../repositories/games"
import { wordsRepository, WordsRepository } from "../repositories/words"

export type DomainConfig = {
  boardWidth: number
  boardHeight: number
}

export type DomainAdapter = {
  config: DomainConfig
  adapters: {
    gamesRepository: GamesRepository
    wordsRepository: WordsRepository
    repositories: RepositoriesAdapter
    uuid: () => string
    currentUtcDateTime: () => moment.Moment
  }
}

export type DomainActionResult<R = void> = ActionResult<DomainAdapter, R>
export type DomainAction<I = void, R = void> = Action<DomainAdapter, I, R>

export const adapt = <R>(a: TaskEither<ServiceError, R>) => fromTaskEither<DomainAdapter, ServiceError, R>(a)

export function ask() {
  return askAction<DomainAdapter>()
}

export const actionOf = <R>(v: R): DomainActionResult<R> => fromEither(right(v))
export function actionErrorOf<R>(error: ServiceError): DomainActionResult<R> {
  return fromEither(left<ServiceError, R>(error))
}

export const withEnv = <R>(f: (env: DomainAdapter) => DomainActionResult<R>) => pipe(ask(), chain(f))

export const buildDomainAdapter = (
  { boardWidth, boardHeight }: AppConfig,
  repositoriesAdapter: RepositoriesAdapter,
): DomainAdapter => ({
  config: {
    boardWidth,
    boardHeight,
  },
  adapters: {
    gamesRepository,
    wordsRepository,
    repositories: repositoriesAdapter,
    uuid: uuidv4,
    currentUtcDateTime,
  },
})
