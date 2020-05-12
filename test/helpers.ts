import * as R from "ramda"
import { currentUtcDateTime } from ".../../../src/utils/dates"
import { Either, fold, getOrElse } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { identity } from "fp-ts/lib/function"
import { Environment } from "../src/environment"
import { createApplication } from "../src/app/main"
import { run } from "fp-ts/lib/ReaderTaskEither"
import { DeepPartial } from "../src/utils/types"
import { ActionResult, actionOf } from "../src/utils/actions"
import { CodeNamesGame, Words } from "../src/domain/models"
import { MongoClient } from "mongodb"

export const createApp = async (environment: Environment) => getRight(await run(createApplication(), environment))

export const x = async () => await run(createApplication(), {} as any)

const words = {
  language: "en",
  words: R.range(0, 50).map(i => `word-${i}`),
}

const defaultEnvironment: Environment = {
  config: {
    mongodb: {
      uri: "",
    },
    nodeEnv: "DEV",
    port: 3000,
    boardWidth: 5,
    boardHeight: 5,
  },
  gamesRepository: {
    insert: jest.fn((game: CodeNamesGame) => actionOf(game)),
    update: jest.fn((game: CodeNamesGame) => actionOf(game)),
    getById: () => actionOf({} as CodeNamesGame),
  },
  wordsRepository: {
    insert: () => actionOf(undefined),
    getByLanguage: () => actionOf(words),
  },
  gamesDomain: {
    create: () => actionOf({} as CodeNamesGame),
    join: () => actionOf({} as CodeNamesGame),
  },
  dbClient: {} as MongoClient,
  uuid: () => "",
  currentUtcDateTime,
  log: () => undefined,
}

export const buildTestEnvironment = (environment: DeepPartial<Environment>): Environment =>
  R.mergeDeepRight(defaultEnvironment, environment)

export const getRight = <L, A>(fa: Either<L, A>) =>
  pipe(
    fa,
    getOrElse<L, A>(e => {
      throw new Error(`Should be Right => ${JSON.stringify(e)}`)
    }),
  )

export const getLeft = <L, A>(fa: Either<L, A>) =>
  pipe(
    fa,
    fold(identity, r => {
      throw new Error(`Should be Left => ${JSON.stringify(r)}`)
    }),
  )

export const getRightAction = async <R>(result: ActionResult<R>, environment: Environment) =>
  getRight(await run(result, environment))

export const getLeftAction = async <R>(result: ActionResult<R>, environment: Environment) =>
  getLeft(await run(result, environment))
