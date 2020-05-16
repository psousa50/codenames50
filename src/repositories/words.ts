import { Words } from "../domain/models"
import { fromPromise, fromVoidPromise } from "../utils/actions"
import { RepositoriesPort } from "./adapters"

const insert: RepositoriesPort<Words> = words =>
  fromVoidPromise(({ adapters: { wordsMongoDbPorts, mongoEnvironment: { adapters: { dbClient } } } }) =>
    wordsMongoDbPorts.insert(dbClient)(words),
  )

const getByLanguage: RepositoriesPort<string, Words | null> = language =>
  fromPromise(({ adapters: { wordsMongoDbPorts, mongoEnvironment: { adapters: { dbClient } } } }) =>
    wordsMongoDbPorts.getByLanguage(dbClient)(language),
  )

export const wordsRepositoryPorts = {
  insert,
  getByLanguage,
}

export type WordsRepositoryPorts = typeof wordsRepositoryPorts
