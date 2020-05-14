import { MongoClient } from "mongodb"
import { Words } from "../domain/models"

const WORDS = "Words"

const insert = (client: MongoClient) => (words: Words) =>
  client
    .db()
    .collection<Words>(WORDS)
    .insertOne(words)
    .then(_ => undefined)

const getByLanguage = (client: MongoClient) => (language: string) =>
  client.db().collection<Words>(WORDS).findOne({ language })

export const wordsMongoDbPorts = {
  insert,
  getByLanguage,
}

export type WordsMongoDbPorts = typeof wordsMongoDbPorts
