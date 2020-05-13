import { MongoClient } from "mongodb"
import { Words } from "../domain/models"

const WORDS = "Words"

const insert = (words: Words) => (client: MongoClient) => client.db().collection<Words>(WORDS).insertOne(words)

const getByLanguage = (language: string) => (client: MongoClient) =>
  client.db().collection<Words>(WORDS).findOne({ language })

export const wordsMongoDb = {
  insert,
  getByLanguage,
}

export type WordsMongoDb = typeof wordsMongoDb
