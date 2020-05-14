import { MongoClient } from "mongodb"
import { CodeNamesGame } from "../domain/models"
import { UUID } from "../utils/types"

const GAMES = "Games"

const insert = (client: MongoClient) => (game: CodeNamesGame) =>
  client
    .db()
    .collection<CodeNamesGame>(GAMES)
    .insertOne(game)
    .then(_ => game)

const update = (client: MongoClient) => (game: CodeNamesGame) =>
  client
    .db()
    .collection<CodeNamesGame>(GAMES)
    .updateOne({ gameId: game.gameId }, { $set: game })
    .then(_ => game)

const getById = (client: MongoClient) => (gameId: UUID) =>
  client.db().collection<CodeNamesGame>(GAMES).findOne({ gameId: gameId })

export const gamesMongoDbPorts = {
  insert,
  update,
  getById,
}

export type GamesMongoDbPorts = typeof gamesMongoDbPorts
