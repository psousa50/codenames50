import { MongoClient } from "mongodb"
import { Words } from "../repositories/words"

const WORDS = "Words"

export const insert = (words: Words) => (client: MongoClient) => client.db().collection<Words>(WORDS).insertOne(words)

export const getByLanguage = (language: string) => (client: MongoClient) =>
  client.db().collection<Words>(WORDS).findOne({ language })
