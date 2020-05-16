import { MongoClient } from "mongodb"

export const buildMongoEnvironment = (dbClient: MongoClient) => ({
  dbClient,
})

export type MongoEnvironment = ReturnType<typeof buildMongoEnvironment>
