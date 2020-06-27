import { GameModels } from "@codenames50/core"
import { MongoEnvironment } from "./adapters"

const WORDS = "Words"

const upsertByLanguage = ({ dbClient }: MongoEnvironment) => (words: GameModels.Words) =>
  dbClient
    .db()
    .collection<GameModels.Words>(WORDS)
    .updateOne({ language: words.language }, { $set: words }, { upsert: true })
    .then(_ => undefined)

const getByLanguage = ({ dbClient }: MongoEnvironment) => (language: string) =>
  dbClient.db().collection<GameModels.Words>(WORDS).findOne({ language })

export const wordsMongoDbPorts = {
  upsertByLanguage,
  getByLanguage,
}

export type WordsMongoDbPorts = typeof wordsMongoDbPorts
