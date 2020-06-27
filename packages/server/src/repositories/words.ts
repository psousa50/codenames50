import { GameModels } from "@codenames50/core"
import { fromPromise, fromVoidPromise } from "../utils/actions"
import { RepositoriesPort } from "./adapters"
import { wordsEn } from "./static/words-en"
import { pipe } from "fp-ts/lib/pipeable"
import { chain } from "fp-ts/lib/ReaderTaskEither"
import { wordsPt } from "./static/words-pt"

const initialize: RepositoriesPort = () =>
  pipe(
    upsertByLanguage(wordsEn),
    chain(_ => upsertByLanguage(wordsPt)),
  )

const upsertByLanguage: RepositoriesPort<GameModels.Words> = words =>
  fromVoidPromise(({ mongoAdapter: { wordsMongoDbPorts, mongoEnvironment } }) =>
    wordsMongoDbPorts.upsertByLanguage(mongoEnvironment)(words),
  )

const getByLanguage: RepositoriesPort<string, GameModels.Words | null> = language =>
  fromPromise(({ mongoAdapter: { wordsMongoDbPorts, mongoEnvironment } }) =>
    wordsMongoDbPorts.getByLanguage(mongoEnvironment)(language),
  )

export const wordsRepositoryPorts = {
  initialize,
  upsertByLanguage,
  getByLanguage,
}

export type WordsRepositoryPorts = typeof wordsRepositoryPorts
