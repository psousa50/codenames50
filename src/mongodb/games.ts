import { v4 as uuidv4 } from "uuid"
import { MongoClient } from "mongodb"
import { NewCodeNameGame, CodeNameGame } from "../repositories/games"
import { UUID } from "../utils/types"

const GAMES = "Games"

export const insert = (game: NewCodeNameGame) => (client: MongoClient) => {
  const gameId = uuidv4()
  return client
    .db()
    .collection<CodeNameGame>(GAMES)
    .insertOne({ gameId, ...game })
    .then(_ => gameId)
}

export const getById = (gameId: UUID) => (client: MongoClient) =>
  client.db().collection<CodeNameGame>(GAMES).findOne({ gameId: gameId })
