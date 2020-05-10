import { MongoClient } from "mongodb"
import { CodeNameGame } from "../repositories/games"
import { UUID } from "../utils/types"

const GAMES = "Games"

export const insert = (game: CodeNameGame) => (client: MongoClient) =>
  client
    .db()
    .collection<CodeNameGame>(GAMES)
    .insertOne(game)
    .then(_ => game.gameId)

export const update = (game: CodeNameGame) => (client: MongoClient) =>
  client.db().collection<CodeNameGame>(GAMES).updateOne({ gameId: game.gameId }, { $set: game })

export const getById = (gameId: UUID) => (client: MongoClient) =>
  client.db().collection<CodeNameGame>(GAMES).findOne({ gameId: gameId })
