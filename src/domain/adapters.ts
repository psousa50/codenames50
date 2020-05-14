import moment from "moment"

import { RepositoriesEnvironment } from "../repositories/adapters"
import { ActionResult, Action, ask as askAction } from "../utils/actions"
import { right, left } from "fp-ts/lib/Either"
import { ServiceError } from "../utils/audit"
import { pipe } from "fp-ts/lib/pipeable"
import { fromEither, chain, fromTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { TaskEither } from "fp-ts/lib/TaskEither"
import { AppConfig } from "../config"
import { v4 as uuidv4 } from "uuid"
import { currentUtcDateTime } from "../utils/dates"
import { gamesRepositoryPorts } from "../repositories/games"
import { wordsRepositoryPorts } from "../repositories/words"
import { buildAdapter, Port, Adapter } from "../utils/adapters"
import { CodeNamesGame, Words } from "./models"
import { UUID } from "../utils/types"

export type DomainConfig = {
  boardWidth: number
  boardHeight: number
}

export type DomainEnvironment = {
  config: DomainConfig
  adapters: {
    gamesRepository: {
      insert: Adapter<CodeNamesGame, CodeNamesGame>
      update: Adapter<CodeNamesGame, CodeNamesGame>
      getById: Adapter<UUID, CodeNamesGame | null>
    }
    wordsRepository: {
      insert: Adapter<Words>
      getByLanguage: Adapter<string, Words | null>
    }
    uuid: () => string
    currentUtcDateTime: () => moment.Moment
  }
}

export type DomainActionResult<R = void> = ActionResult<DomainEnvironment, R>
export type DomainAction<I = void, R = void> = Action<DomainEnvironment, I, R>
export type DomainPort<I = void, R = void> = Port<DomainEnvironment, I, R>

export const adapt = <R>(a: TaskEither<ServiceError, R>) => fromTaskEither<DomainEnvironment, ServiceError, R>(a)

export function ask() {
  return askAction<DomainEnvironment>()
}

export const actionOf = <R>(v: R): DomainActionResult<R> => fromEither(right(v))
export function actionErrorOf<R>(error: ServiceError): DomainActionResult<R> {
  return fromEither(left<ServiceError, R>(error))
}

export const withEnv = <R>(f: (env: DomainEnvironment) => DomainActionResult<R>) => pipe(ask(), chain(f))

export const buildDomainEnvironment = (
  { boardWidth, boardHeight }: AppConfig,
  repositoriesEnvironment: RepositoriesEnvironment,
): DomainEnvironment => ({
  config: {
    boardWidth,
    boardHeight,
  },
  adapters: {
    gamesRepository: {
      insert: buildAdapter(repositoriesEnvironment, gamesRepositoryPorts.insert),
      update: buildAdapter(repositoriesEnvironment, gamesRepositoryPorts.update),
      getById: buildAdapter(repositoriesEnvironment, gamesRepositoryPorts.getById),
    },
    wordsRepository: {
      insert: buildAdapter(repositoriesEnvironment, wordsRepositoryPorts.insert),
      getByLanguage: buildAdapter(repositoriesEnvironment, wordsRepositoryPorts.getByLanguage),
    },
    uuid: uuidv4,
    currentUtcDateTime: currentUtcDateTime,
  },
})
