import { gamePorts } from "@codenames50/core"
import { pipe } from "fp-ts/lib/pipeable"
import { task } from "fp-ts/lib/Task"
import { fold, getOrElse, TaskEither } from "fp-ts/lib/TaskEither"
import { MongoClient } from "mongodb"
import * as R from "ramda"
import { buildExpressEnvironment, ExpressEnvironment } from "../src/app/adapters"
import { buildDomainEnvironment, DomainEnvironment } from "../src/domain/adapters"
import { buildGameMessagingEnvironment } from "../src/messaging/adapters"
import { buildMessengerEnvironment } from "../src/messaging/messenger"
import { buildMongoEnvironment } from "../src/mongodb/adapters"
import { buildRepositoriesEnvironment } from "../src/repositories/adapters"
import { actionOf } from "../src/utils/actions"
import { Types } from "@psousa50/shared"

const defaultConfig = {
  mongodb: {
    uri: "",
  },
  nodeEnv: "",
  port: 3000,
  boardWidth: 5,
  boardHeight: 5,
}

const voidAction = jest.fn(() => actionOf(undefined))

const gamesMongoDbPorts = {
  insert: jest.fn(),
  update: jest.fn(),
  getById: jest.fn(),
}

const wordsMongoDbPorts = {
  upsertByLanguage: jest.fn(),
  getByLanguage: jest.fn(),
}

const gamesRepositoryPorts = {
  insert: jest.fn(),
  update: jest.fn(),
  getById: jest.fn(),
}

const wordsRepositoryPorts = {
  initialize: jest.fn(),
  upsertByLanguage: jest.fn(),
  getByLanguage: jest.fn(),
}

export const messengerPorts = {
  emit: jest.fn(),
  broadcast: jest.fn(),
  getSocketIdsForRoomId: jest.fn(),
}

export const gameMessagingPorts = {
  emitMessage: voidAction,
  registerUser: jest.fn(),
  unregisterSocket: jest.fn(),
  addGameToUser: jest.fn(),
  broadcastMessage: voidAction,
}

export const buildDefaultTestDomainEnvironment = () => {
  const dbClient = jest.fn(() => Promise.resolve(undefined)) as any
  const mongoEnvironment = buildMongoEnvironment(dbClient)
  const io = {
    sockets: {
      sockets: [],
    },
  } as any
  const messengerEnvironment = buildMessengerEnvironment(io)
  const gameMessagingEnvironment = buildGameMessagingEnvironment(messengerEnvironment, messengerPorts)
  const repositoriesEnvironment = buildRepositoriesEnvironment(mongoEnvironment, gamesMongoDbPorts, wordsMongoDbPorts)
  const domainEnvironment = buildDomainEnvironment(
    defaultConfig,
    repositoriesEnvironment,
    gamesRepositoryPorts,
    wordsRepositoryPorts,
    gameMessagingEnvironment,
    gameMessagingPorts,
    gamePorts,
  )

  return domainEnvironment
}

export const buildDefaultTestExpressEnvironment = () =>
  buildExpressEnvironment(defaultConfig, buildDefaultTestDomainEnvironment(), {} as any)

export const buildTestRepositoriesEnvironment = (dbClient: MongoClient) => {
  const mongoEnvironment = buildMongoEnvironment(dbClient)
  const repositoriesEnvironment = buildRepositoriesEnvironment(mongoEnvironment, gamesMongoDbPorts, wordsMongoDbPorts)

  return repositoriesEnvironment
}

export const buildTestDomainEnvironment = (domainEnvironment: Types.DeepPartial<DomainEnvironment> = {}) =>
  R.mergeDeepRight(buildDefaultTestDomainEnvironment(), domainEnvironment)

export const buildTestExpressEnvironment = (
  expressEnvironment: Types.DeepPartial<ExpressEnvironment> = {},
): ExpressEnvironment => ({
  ...buildDefaultTestExpressEnvironment(),
  ...(expressEnvironment as any),
})

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
