import { fromPromise, fromVoidPromise } from "../utils/actions"
import { Words } from "../domain/models"
import { RepositoriesPort } from "./adapters"

const insert: RepositoriesPort<Words> = words =>
  fromVoidPromise(({ adapters: { wordsMongoDb } }) => wordsMongoDb.insert(words))

const getByLanguage: RepositoriesPort<string, Words | null> = language =>
  fromPromise(({ adapters: { wordsMongoDb } }) => wordsMongoDb.getByLanguage(language))

export const wordsRepositoryPorts = {
  insert,
  getByLanguage,
}

export type WordsRepositoryPorts = typeof wordsRepositoryPorts
