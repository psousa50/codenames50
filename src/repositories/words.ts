import { Action, fromPromise, fromVoidPromise } from "../utils/actions"
import * as MongoWords from "../mongodb/words"

export interface Words {
  language: string
  words: string[]
}

const insert: Action<Words> = words => fromVoidPromise(env => MongoWords.insert(words)(env.dbClient))

const getByLanguage: Action<string, Words | null> = language =>
  fromPromise(env => MongoWords.getByLanguage(language)(env.dbClient))

export const wordsRepository = {
  insert,
  getByLanguage,
}

export type WordsRepository = typeof wordsRepository
