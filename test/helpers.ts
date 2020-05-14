import * as R from "ramda"
import { currentUtcDateTime } from ".../../../src/utils/dates"
import { pipe } from "fp-ts/lib/pipeable"
import { fold, getOrElse } from "fp-ts/lib/TaskEither"
import { DeepPartial } from "../src/utils/types"
import { actionOf } from "../src/utils/actions"
import { CodeNamesGame } from "../src/domain/models"
import { DomainAdapter } from "../src/domain/adapters"
import { TaskEither } from "fp-ts/lib/TaskEither"
import { RepositoriesAdapter } from "../src/repositories/adapters"
import { task } from "fp-ts/lib/Task"
import { ExpressAdapter } from "../src/app/adapters"

const words = {
  language: "en",
  words: R.range(0, 50).map(i => `word-${i}`),
}

const defaultMongoAdapter = {
  gamesMongoDb: {
    insert: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
  },
  wordsMongoDb: {
    insert: jest.fn(),
    getByLanguage: jest.fn(),
  },
  adapters: {
    dbClient: {},
  },
} as any

const defaultRepositoriesAdapter = {
  adapters: {
    mongoAdapter: defaultMongoAdapter,
  },
}

export const buildTestRepositoriesAdapter = (
  repositoriesAdapter: DeepPartial<RepositoriesAdapter>,
): RepositoriesAdapter => R.mergeDeepRight(defaultRepositoriesAdapter, repositoriesAdapter)

const defaultDomainAdapter = {
  config: {
    boardWidth: 5,
    boardHeight: 5,
  },
  adapters: {
    gamesRepository: {
      insert: jest.fn((game: CodeNamesGame) => actionOf(game)),
      update: jest.fn((game: CodeNamesGame) => actionOf(game)),
      getById: () => actionOf({} as CodeNamesGame),
    },
    wordsRepository: {
      insert: () => actionOf(undefined),
      getByLanguage: () => actionOf(words),
    },
    repositories: defaultRepositoriesAdapter,
    uuid: () => "",
    currentUtcDateTime,
  },
}

export const buildTestDomainAdapter = (domainAdapter: DeepPartial<DomainAdapter> = {}): DomainAdapter =>
  R.mergeDeepRight(defaultDomainAdapter, domainAdapter)

const defaultExpressAdapter: ExpressAdapter = {
  config: {
    port: 3000,
  },
  adapters: {
    gamesDomain: {
      create: () => actionOf<DomainAdapter, CodeNamesGame>({} as CodeNamesGame),
      join: () => actionOf<DomainAdapter, CodeNamesGame>({} as CodeNamesGame),
      revealWord: () => actionOf<DomainAdapter, CodeNamesGame>({} as CodeNamesGame),
      changeTurn: () => actionOf<DomainAdapter, CodeNamesGame>({} as CodeNamesGame),
    },
    domain: defaultDomainAdapter,
  },
}

export const buildTestExpressAdapter = (expressAdapter: DeepPartial<ExpressAdapter>): ExpressAdapter =>
  R.mergeDeepRight(defaultExpressAdapter, expressAdapter)

export const getRight = <L, A>(fa: TaskEither<L, A>) =>
  pipe(
    fa,
    getOrElse<L, A>(e => {
      throw new Error(`Should be Right => ${JSON.stringify(e)}`)
    }),
  )

export const getLeft = <L, A>(fa: TaskEither<L, A>) =>
  pipe(
    fa,
    fold(
      e => task.of(e),
      r => {
        throw new Error(`Should be Left => ${JSON.stringify(r)}`)
      },
    ),
  )
