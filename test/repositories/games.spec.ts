import { MongoMemoryServer } from "mongodb-memory-server"
import { buildMongoEnvironment } from "../../src/mongodb/adapters"
import { gamesMongoDbPorts } from "../../src/mongodb/games"
import { connect } from "../../src/mongodb/main"
import { wordsMongoDbPorts } from "../../src/mongodb/words"
import { buildRepositoriesEnvironment } from "../../src/repositories/adapters"
import { gamesRepositoryPorts } from "../../src/repositories/games"
import { getRight } from "../helpers"

it("insert and getById", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const mongoEnviroment = buildMongoEnvironment(dbClient)
  const repositoriesAdapter = buildRepositoriesEnvironment(mongoEnviroment, gamesMongoDbPorts, wordsMongoDbPorts)

  const gameToInsert = {
    gameId: "some-id",
    userId: "id2",
    players: [],
    something: "else",
  } as any

  const game = await getRight(gamesRepositoryPorts.insert(gameToInsert)(repositoriesAdapter))()

  const insertedGame = await getRight(gamesRepositoryPorts.getById(game.gameId)(repositoriesAdapter))()

  mongoServer.stop()

  expect(insertedGame).toMatchObject(gameToInsert)
})

it("update and getById", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const mongoEnviroment = buildMongoEnvironment(dbClient)
  const repositoriesAdapter = buildRepositoriesEnvironment(mongoEnviroment, gamesMongoDbPorts, wordsMongoDbPorts)

  const gameId = "some-game-id"
  const gameToInsert = {
    gameId,
    userId: "id2",
    something: "else",
  } as any

  await getRight(gamesRepositoryPorts.insert(gameToInsert)(repositoriesAdapter))()

  const gameToUpdate = {
    gameId,
    userId: "id2",
    something: "different",
    andAlso: "this",
    someNullField: undefined,
    someUndefinedField: undefined,
  } as any

  await getRight(gamesRepositoryPorts.update(gameToUpdate)(repositoriesAdapter))()

  const updatedGame = await getRight(gamesRepositoryPorts.getById(gameId)(repositoriesAdapter))()

  mongoServer.stop()

  const expectedGame = {
    ...gameToUpdate,
    someNullField: undefined,
    someUndefinedField: undefined,
  }

  expect(updatedGame).toMatchObject(expectedGame)
})

describe("getById", () => {
  it("return null if not found", async () => {
    const mongoServer = new MongoMemoryServer()
    const mongoUri = await mongoServer.getUri()

    const dbClient = await connect(mongoUri)
    const mongoEnviroment = buildMongoEnvironment(dbClient)
    const repositoriesAdapter = buildRepositoriesEnvironment(mongoEnviroment, gamesMongoDbPorts, wordsMongoDbPorts)

    const insertedGame = await getRight(gamesRepositoryPorts.getById("some-id")(repositoriesAdapter))()

    mongoServer.stop()

    expect(insertedGame).toBeNull()
  })
})
