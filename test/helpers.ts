import * as R from "ramda"
import { currentUtcDateTime } from ".../../../src/utils/dates"
import { pipe } from "fp-ts/lib/pipeable"
import { fold, getOrElse } from "fp-ts/lib/TaskEither"
import { DeepPartial } from "../src/utils/types"
import { actionOf } from "../src/utils/actions"
import { CodeNamesGame } from "../src/domain/models"
import { DomainEnvironment, buildDomainEnvironment } from "../src/domain/adapters"
import { TaskEither } from "fp-ts/lib/TaskEither"
import { task } from "fp-ts/lib/Task"
import { ExpressEnvironment, buildExpressEnvironment } from "../src/app/adapters"
import { buildMongoEnvironment } from "../src/mongodb/adapters"
import { buildRepositoriesEnvironment } from "../src/repositories/adapters"
import { config } from "dotenv/types"
import { AppConfig } from "../src/config"
import { MongoClient } from "mongodb"

const words = {
  language: "en",
  words: R.range(0, 50).map(i => `word-${i}`),
}

const defaultConfig = {
  mongodb: {
    uri: "",
  },
  nodeEnv: "",
  port: 3000,
  boardWidth: 5,
  boardHeight: 5,
}

export const buildDefaultTestDomainEnvironment = () => {
  const dbClient = jest.fn(() => Promise.resolve(undefined)) as any
  const mongoEnvironment = buildMongoEnvironment(dbClient)
  const repositoriesEnvironment = buildRepositoriesEnvironment(mongoEnvironment)
  const domainEnvironment = buildDomainEnvironment(defaultConfig, repositoriesEnvironment)

  return domainEnvironment
}

export const buildDefaultTestExpressEnvironment = () =>
  buildExpressEnvironment(defaultConfig, buildDefaultTestDomainEnvironment())

export const buildTestRepositoriesEnvironment = (dbClient: MongoClient) => {
  const mongoEnvironment = buildMongoEnvironment(dbClient)
  const repositoriesEnvironment = buildRepositoriesEnvironment(mongoEnvironment)

  return repositoriesEnvironment
}

export const buildTestDomainEnvironment = (domainEnvironment: DeepPartial<DomainEnvironment> = {}): DomainEnvironment =>
  R.mergeDeepRight(buildDefaultTestDomainEnvironment(), domainEnvironment)

export const buildTestExpressEnvironment = (
  expressEnvironment: DeepPartial<ExpressEnvironment> = {},
): ExpressEnvironment => R.mergeDeepRight(buildDefaultTestExpressEnvironment(), expressEnvironment)

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
