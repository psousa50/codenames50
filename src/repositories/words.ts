import { Words } from "../codenames-core/models"
import { fromPromise, fromVoidPromise } from "../utils/actions"
import { RepositoriesPort } from "./adapters"

const insert: RepositoriesPort<Words> = words =>
  fromVoidPromise(({ mongoAdapter: { wordsMongoDbPorts, mongoEnvironment } }) =>
    wordsMongoDbPorts.insert(mongoEnvironment)(words),
  )

const getByLanguage: RepositoriesPort<string, Words | null> = language =>
  fromPromise(({ mongoAdapter: { wordsMongoDbPorts, mongoEnvironment } }) =>
    wordsMongoDbPorts.getByLanguage(mongoEnvironment)(language),
  )

export const wordsRepositoryPorts = {
  insert,
  getByLanguage,
}

export type WordsRepositoryPorts = typeof wordsRepositoryPorts
