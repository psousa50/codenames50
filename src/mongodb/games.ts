import { MongoClient } from "mongodb"
import { CodeNamesGame } from "../domain/models"
import { UUID } from "../utils/types"

const GAMES = "Games"

const insert = (game: CodeNamesGame) => (client: MongoClient) =>
  client
    .db()
    .collection<CodeNamesGame>(GAMES)
    .insertOne(game)
    .then(_ => game)

const update = (game: CodeNamesGame) => (client: MongoClient) =>
  client
    .db()
    .collection<CodeNamesGame>(GAMES)
    .updateOne({ gameId: game.gameId }, { $set: game })
    .then(_ => game)

const getById = (gameId: UUID) => (client: MongoClient) =>
  client.db().collection<CodeNamesGame>(GAMES).findOne({ gameId: gameId })

export const gamesMongoDb = {
  insert,
  update,
  getById,
}

export type GamesMongoDb = typeof gamesMongoDb
