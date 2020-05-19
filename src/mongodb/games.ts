import { CodeNamesGame } from "../game/models"
import { UUID } from "../utils/types"
import { MongoEnvironment } from "./adapters"

const GAMES = "Games"

const insert = ({ dbClient }: MongoEnvironment) => (game: CodeNamesGame) =>
  dbClient
    .db()
    .collection<CodeNamesGame>(GAMES)
    .insertOne(game)
    .then(_ => game)

const update = ({ dbClient }: MongoEnvironment) => (game: CodeNamesGame) =>
  dbClient
    .db()
    .collection<CodeNamesGame>(GAMES)
    .updateOne({ gameId: game.gameId }, { $set: game })
    .then(_ => game)

const getById = ({ dbClient }: MongoEnvironment) => (gameId: UUID) =>
  dbClient.db().collection<CodeNamesGame>(GAMES).findOne({ gameId: gameId })

export const gamesMongoDbPorts = {
  insert,
  update,
  getById,
}

export type GamesMongoDbPorts = typeof gamesMongoDbPorts
