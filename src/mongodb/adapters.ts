import { MongoClient } from "mongodb"

export type MongoEnvironment = {
  adapters: {
    dbClient: MongoClient
  }
}

export const buildMongoEnvironment = (dbClient: MongoClient): MongoEnvironment => ({
  adapters: {
    dbClient,
  },
})
