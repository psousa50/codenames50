import { GameModels } from "@codenames50/core"
import { UUID } from "../utils/types"
import { MongoEnvironment } from "./adapters"

const GAMES = "Games"

const insert =
  ({ dbClient }: MongoEnvironment) =>
  async (game: GameModels.CodeNamesGame) => {
    const result = await dbClient.db().collection<GameModels.CodeNamesGame>(GAMES).insertOne(game)

    // In v6.x, we need to fetch the inserted document manually if we need the full object
    return dbClient.db().collection<GameModels.CodeNamesGame>(GAMES).findOne({ _id: result.insertedId }) || game
  }

const update =
  ({ dbClient }: MongoEnvironment) =>
  async (game: GameModels.CodeNamesGame) => {
    const result = await dbClient
      .db()
      .collection<GameModels.CodeNamesGame>(GAMES)
      .findOneAndUpdate({ gameId: game.gameId }, { $set: game }, { returnDocument: "after" })

    return result || game
  }

const getById =
  ({ dbClient }: MongoEnvironment) =>
  (gameId: UUID) =>
    dbClient.db().collection<GameModels.CodeNamesGame>(GAMES).findOne({ gameId: gameId })

export const gamesMongoDbPorts = {
  insert,
  update,
  getById,
}

export type GamesMongoDbPorts = typeof gamesMongoDbPorts
