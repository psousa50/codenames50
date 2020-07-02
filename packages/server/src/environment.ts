import { gamePorts } from "@codenames50/core"
import { MongoClient } from "mongodb"
import socketIo from "socket.io"
import { AppConfig } from "./config"
import { buildDomainEnvironment } from "./domain/adapters"
import { buildGameMessagingEnvironment } from "./messaging/adapters"
import { gameMessagingPorts } from "./messaging/main"
import { buildMessengerEnvironment, messengerPorts } from "./messaging/messenger"
import { buildMongoEnvironment } from "./mongodb/adapters"
import { gamesMongoDbPorts } from "./mongodb/games"
import { wordsMongoDbPorts } from "./mongodb/words"
import { buildRepositoriesEnvironment } from "./repositories/adapters"
import { gamesRepositoryPorts } from "./repositories/games"
import { wordsRepositoryPorts } from "./repositories/words"

export const buildDomainEnvironmentForExternalServices = (
  config: AppConfig,
  dbClient: MongoClient,
  io: socketIo.Server,
) => {
  const mongoEnvironment = buildMongoEnvironment(dbClient)
  const repositoriesEnvironment = buildRepositoriesEnvironment(mongoEnvironment, gamesMongoDbPorts, wordsMongoDbPorts)
  const messengerEnvironment = buildMessengerEnvironment(io)
  const gameMessagingEnvironment = buildGameMessagingEnvironment(messengerEnvironment, messengerPorts)
  const domainEnvironment = buildDomainEnvironment(
    config,
    repositoriesEnvironment,
    gamesRepositoryPorts,
    wordsRepositoryPorts,
    gameMessagingEnvironment,
    gameMessagingPorts,
    gamePorts,
  )

  return domainEnvironment
}
