import { gameActions } from "@psousa50/codenames50-core/lib/main"
import { gameRules } from "@psousa50/codenames50-core/lib/rules"
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
import { DeepPartial } from "../src/utils/types"

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
  insert: jest.fn(),
  getByLanguage: jest.fn(),
}

const gamesRepositoryPorts = {
  insert: jest.fn(),
  update: jest.fn(),
  getById: jest.fn(),
}

const wordsRepositoryPorts = {
  insert: jest.fn(),
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
    gameActions,
    gameRules,
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

export const buildTestDomainEnvironment = (domainEnvironment: DeepPartial<DomainEnvironment> = {}) =>
  R.mergeDeepRight(buildDefaultTestDomainEnvironment(), domainEnvironment)

export const buildTestExpressEnvironment = (
  expressEnvironment: DeepPartial<ExpressEnvironment> = {},
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
