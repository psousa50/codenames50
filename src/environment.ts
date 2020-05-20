import { MongoClient } from "mongodb"
import * as R from "ramda"
import socketIo from "socket.io"
import { AppConfig } from "./config"
import { buildDomainEnvironment } from "./domain/adapters"
import { GameActions, gameActions } from "./game/main"
import { CodeNamesGame } from "./game/models"
import { GameRules, gameRules } from "./game/rules"
import { buildGameMessagingEnvironment } from "./messaging/adapters"
import { GameMessagingPorts, gameMessagingPorts } from "./messaging/main"
import { buildMessengerEnvironment, MessengerPorts, messengerPorts } from "./messaging/messenger"
import { buildMongoEnvironment } from "./mongodb/adapters"
import { GamesMongoDbPorts, gamesMongoDbPorts } from "./mongodb/games"
import { WordsMongoDbPorts, wordsMongoDbPorts } from "./mongodb/words"
import { buildRepositoriesEnvironment } from "./repositories/adapters"
import { GamesRepositoryPorts, gamesRepositoryPorts } from "./repositories/games"
import { WordsRepositoryPorts, wordsRepositoryPorts } from "./repositories/words"
import { buildAdapter } from "./utils/adapters"

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
  gameActions: GameActions,
  gameRules: GameRules,
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

const nullToUndefined = (game: CodeNamesGame | null) =>
  game ? R.keys(game).reduce((acc, k) => ({ ...acc, [k]: acc[k] === null ? undefined : acc[k] }), game) : game

export const buildDomainEnvironmentWithRealPorts = (config: AppConfig, dbClient: MongoClient, io: socketIo.Server) =>
  buildCompleteDomainEnvironment(
    config,
    dbClient,
    io,
    {
      ...gamesRepositoryPorts,
      getById: buildAdapter(gamesRepositoryPorts.getById, undefined, undefined, nullToUndefined),
    },
    wordsRepositoryPorts,
    gamesMongoDbPorts,
    wordsMongoDbPorts,
    gameMessagingPorts,
    messengerPorts,
    gameActions,
    gameRules,
  )
