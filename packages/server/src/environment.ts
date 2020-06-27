import { GameActions, GameRules } from "@codenames50/core"
import { MongoClient } from "mongodb"
import socketIo from "socket.io"
import { AppConfig } from "./config"
import { buildDomainEnvironment } from "./domain/adapters"
import { buildGameMessagingEnvironment } from "./messaging/adapters"
import { GameMessagingPorts, gameMessagingPorts } from "./messaging/main"
import { buildMessengerEnvironment, MessengerPorts, messengerPorts } from "./messaging/messenger"
import { buildMongoEnvironment } from "./mongodb/adapters"
import { GamesMongoDbPorts, gamesMongoDbPorts } from "./mongodb/games"
import { WordsMongoDbPorts, wordsMongoDbPorts } from "./mongodb/words"
import { buildRepositoriesEnvironment } from "./repositories/adapters"
import { GamesRepositoryPorts, gamesRepositoryPorts } from "./repositories/games"
import { WordsRepositoryPorts, wordsRepositoryPorts } from "./repositories/words"

export const buildCompleteDomainEnvironment = (
  config: AppConfig,
  dbClient: MongoClient,
  io: socketIo.Server,
  gamesRepositoryPorts: GamesRepositoryPorts,
  wordsRepositoryPorts: WordsRepositoryPorts,
  gamesMongoDbPorts: GamesMongoDbPorts,
  wordsMongoDbPorts: WordsMongoDbPorts,
  gameMessagingPorts: GameMessagingPorts,
  messengerPorts: MessengerPorts,
  gameActions: GameActions.GameActions,
  gameRules: GameRules.GameRules,
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
    gameActions,
    gameRules,
  )

  return domainEnvironment
}

export const buildDomainEnvironmentWithRealPorts = (config: AppConfig, dbClient: MongoClient, io: socketIo.Server) =>
  buildCompleteDomainEnvironment(
    config,
    dbClient,
    io,
    gamesRepositoryPorts,
    wordsRepositoryPorts,
    gamesMongoDbPorts,
    wordsMongoDbPorts,
    gameMessagingPorts,
    messengerPorts,
    GameActions.gameActions,
    GameRules.gameRules,
  )
