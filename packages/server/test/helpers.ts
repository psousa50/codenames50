import { gamePorts } from "@codenames50/core"
import { pipe } from "fp-ts/lib/pipeable"
import { task } from "fp-ts/lib/Task"
import { fold, getOrElse, TaskEither } from "fp-ts/lib/TaskEither"
import { MongoClient } from "mongodb"
import * as R from "ramda"
import { vi } from "vitest"
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

const voidAction = vi.fn(() => actionOf(undefined))

export const gamesMongoDbPorts = {
  insert: vi.fn(),
  update: vi.fn(),
  getById: vi.fn(),
}

export const wordsMongoDbPorts = {
  upsertByLanguage: vi.fn(),
  getByLanguage: vi.fn(),
}

const gamesRepositoryPorts = {
  insert: vi.fn((game: any) => actionOf(game)),
  update: vi.fn((game: any) => actionOf(game)),
  getById: vi.fn((_id: any) => actionOf(undefined as any)), // Default: game not found
}

const wordsRepositoryPorts = {
  initialize: vi.fn(() => actionOf(undefined as any)),
  upsertByLanguage: vi.fn((_wl: any) => actionOf(undefined as any)),
  getByLanguage: vi.fn((_lang: any) => actionOf(undefined as any)), // Default: language not found
}

export const messengerPorts = {
  emit: vi.fn(),
  broadcast: vi.fn(),
  getSocketIdsForRoomId: vi.fn(),
}

export const gameMessagingPorts = {
  emitMessage: voidAction,
  registerUser: vi.fn(),
  unregisterSocket: vi.fn(),
  addGameToUser: vi.fn(),
  broadcastMessage: voidAction,
}

export const buildDefaultTestDomainEnvironment = () => {
  const dbClient = vi.fn(() => Promise.resolve(undefined)) as any
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
