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
import { CodeNameGame, Words } from "../src/domain/models"
import { MongoClient } from "mongodb"

export const createApp = async (environment: Environment) => getRight(await run(createApplication(), environment))

export const x = async () => await run(createApplication(), {} as any)

const defaultEnvironment: Environment = {
  config: {
    mongodb: {
      uri: "",
    },
    nodeEnv: "DEV",
    port: 3000,
    numberOfWords: 25,
  },
  gamesRepository: {
    insert: () => actionOf(""),
    update: () => actionOf(undefined),
    getById: () => actionOf({} as CodeNameGame),
  },
  wordsRepository: {
    insert: () => actionOf(undefined),
    getByLanguage: () => actionOf({} as Words),
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
