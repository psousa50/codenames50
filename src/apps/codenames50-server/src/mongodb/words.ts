import { Words } from "codenames50-core/lib/models"
import { MongoEnvironment } from "./adapters"

const WORDS = "Words"

const upsertByLanguage = ({ dbClient }: MongoEnvironment) => (words: Words) =>
  dbClient
    .db()
    .collection<Words>(WORDS)
    .updateOne({ language: words.language }, { $set: words }, { upsert: true })
    .then(_ => undefined)

const getByLanguage = ({ dbClient }: MongoEnvironment) => (language: string) =>
  dbClient.db().collection<Words>(WORDS).findOne({ language })

export const wordsMongoDbPorts = {
  upsertByLanguage,
  getByLanguage,
}

export type WordsMongoDbPorts = typeof wordsMongoDbPorts
