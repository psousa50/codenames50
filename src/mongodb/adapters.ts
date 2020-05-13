import { MongoClient } from "mongodb"
import { GamesMongoDb } from "./games"
import { WordsMongoDb } from "./words"
import { gamesMongoDb } from "./games"
import { wordsMongoDb } from "./words"

export type MongoAdapter = {
  gamesMongoDb: GamesMongoDb
  wordsMongoDb: WordsMongoDb
  adapters: {
    dbClient: MongoClient
  }
}

export const buildMongoAdapter = (dbClient: MongoClient): MongoAdapter => ({
  gamesMongoDb,
  wordsMongoDb,
  adapters: {
    dbClient,
  },
})
