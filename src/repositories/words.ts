import { fromPromise, fromVoidPromise } from "../utils/actions"
import { Words } from "../domain/models"
import { RepositoriesAction } from "./adapters"

const insert: RepositoriesAction<Words> = words =>
  fromVoidPromise(env =>
    env.adapters.mongoAdapter.wordsMongoDb.insert(words)(env.adapters.mongoAdapter.adapters.dbClient),
  )

const getByLanguage: RepositoriesAction<string, Words | null> = language =>
  fromPromise(env =>
    env.adapters.mongoAdapter.wordsMongoDb.getByLanguage(language)(env.adapters.mongoAdapter.adapters.dbClient),
  )

export const wordsRepository = {
  insert,
  getByLanguage,
}

export type WordsRepository = typeof wordsRepository
