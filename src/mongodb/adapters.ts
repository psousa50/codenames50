import { MongoClient } from "mongodb"
import { GamesMongoDb } from "./games"
import { WordsMongoDb } from "./words"

export type MongoAdapter = {
  gamesMongoDb: GamesMongoDb
  wordsMongoDb: WordsMongoDb
  adapters: {
    dbClient: MongoClient
  }
}
