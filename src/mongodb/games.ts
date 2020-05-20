import * as R from "ramda"
import { CodeNamesGame } from "../game/models"
import { UUID } from "../utils/types"
import { MongoEnvironment } from "./adapters"

const GAMES = "Games"

const nullToUndefined = <T extends { [K: string]: any }>(game: T): T =>
  R.keys(game).reduce(
    (acc, k) => ({
      ...acc,
      [k]: acc[k] === null ? undefined : typeof acc[k] === "object" ? nullToUndefined(acc[k]) : acc[k],
    }),
    game,
  )

const insert = ({ dbClient }: MongoEnvironment) => (game: CodeNamesGame) =>
  dbClient
    .db()
    .collection<CodeNamesGame>(GAMES)
    .insertOne(game)
    .then(r => r.ops[0])

const update = ({ dbClient }: MongoEnvironment) => (game: CodeNamesGame) =>
  dbClient
    .db()
    .collection<CodeNamesGame>(GAMES)
    .findOneAndUpdate({ gameId: game.gameId }, { $set: game }, { returnOriginal: false })
    .then(r => (r.value ? nullToUndefined(r.value) : game))

const getById = ({ dbClient }: MongoEnvironment) => (gameId: UUID) =>
  dbClient
    .db()
    .collection<CodeNamesGame>(GAMES)
    .findOne({ gameId: gameId })
    .then(g => (g ? nullToUndefined(g) : g))

export const gamesMongoDbPorts = {
  insert,
  update,
  getById,
}

export type GamesMongoDbPorts = typeof gamesMongoDbPorts
