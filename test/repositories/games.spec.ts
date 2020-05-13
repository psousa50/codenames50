import { MongoMemoryServer } from "mongodb-memory-server"
import { connect } from "../../src/mongodb/main"
import { gamesRepository } from "../../src/repositories/games"
import { wordsRepository } from "../../src/repositories/words"
import { getRight } from "../helpers"
import { MongoClient } from "mongodb"
import { gamesMongoDb } from "../../src/mongodb/games"
import { wordsMongoDb } from "../../src/mongodb/words"

const buildRepositoriesAdapter = (dbClient: MongoClient) => {
  const mongoAdapter = {
    gamesMongoDb,
    wordsMongoDb,
    adapters: {
      dbClient,
    },
  }

  const repositoriesAdapter = {
    gamesRepository,
    wordsRepository,
    adapters: {
      mongoAdapter,
    },
  }

  return repositoriesAdapter
}

it("insert and getById", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const repositoriesAdapter = buildRepositoriesAdapter(dbClient)

  const gameToInsert = {
    gameId: "some-id",
    userId: "id2",
    players: [],
    something: "else",
  } as any

  const game = await getRight(gamesRepository.insert(gameToInsert)(repositoriesAdapter))()

  const insertedGame = await getRight(gamesRepository.getById(game.gameId)(repositoriesAdapter))()

  mongoServer.stop()

  expect(insertedGame).toMatchObject(gameToInsert)
})

it("update and getById", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const repositoriesAdapter = buildRepositoriesAdapter(dbClient)

  const gameId = "some-game-id"
  const gameToInsert = {
    gameId,
    userId: "id2",
    something: "else",
  } as any

  await getRight(gamesRepository.insert(gameToInsert)(repositoriesAdapter))()

  const gameToUpdate = {
    gameId,
    userId: "id2",
    something: "different",
    andAlso: "this",
  } as any

  await getRight(gamesRepository.update(gameToUpdate)(repositoriesAdapter))()

  const updatedGame = await getRight(gamesRepository.getById(gameId)(repositoriesAdapter))()

  mongoServer.stop()

  expect(updatedGame).toMatchObject(gameToUpdate)
})

describe("getById", () => {
  it("return null if not found", async () => {
    const mongoServer = new MongoMemoryServer()
    const mongoUri = await mongoServer.getUri()

    const dbClient = await connect(mongoUri)
    const repositoriesAdapter = buildRepositoriesAdapter(dbClient)

    const insertedGame = await getRight(gamesRepository.getById("some-id")(repositoriesAdapter))()

    mongoServer.stop()

    expect(insertedGame).toBeNull()
  })
})
