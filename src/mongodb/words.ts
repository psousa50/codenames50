import { Words } from "../domain/models"
import { MongoEnvironment } from "./adapters"

const WORDS = "Words"

const insert = ({ dbClient }: MongoEnvironment) => (words: Words) =>
  dbClient
    .db()
    .collection<Words>(WORDS)
    .insertOne(words)
    .then(_ => undefined)

const getByLanguage = ({ dbClient }: MongoEnvironment) => (language: string) =>
  dbClient.db().collection<Words>(WORDS).findOne({ language })

export const wordsMongoDbPorts = {
  insert,
  getByLanguage,
}

export type WordsMongoDbPorts = typeof wordsMongoDbPorts
