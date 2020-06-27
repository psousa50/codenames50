import { GameModels } from "@codenames50/core"
import { UUID } from "../utils/types"
import { MongoEnvironment } from "./adapters"

const GAMES = "Games"

const insert = ({ dbClient }: MongoEnvironment) => (game: GameModels.CodeNamesGame) =>
  dbClient
    .db()
    .collection<GameModels.CodeNamesGame>(GAMES)
    .insertOne(game)
    .then(r => r.ops[0])

const update = ({ dbClient }: MongoEnvironment) => (game: GameModels.CodeNamesGame) =>
  dbClient
    .db()
    .collection<GameModels.CodeNamesGame>(GAMES)
    .findOneAndUpdate({ gameId: game.gameId }, { $set: game }, { returnOriginal: false })
    .then(r => r.value || game)

const getById = ({ dbClient }: MongoEnvironment) => (gameId: UUID) =>
  dbClient.db().collection<GameModels.CodeNamesGame>(GAMES).findOne({ gameId: gameId })

export const gamesMongoDbPorts = {
  insert,
  update,
  getById,
}

export type GamesMongoDbPorts = typeof gamesMongoDbPorts
