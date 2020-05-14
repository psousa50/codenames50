import { MongoMemoryServer } from "mongodb-memory-server"
import { connect } from "../../src/mongodb/main"
import { gamesRepositoryPorts } from "../../src/repositories/games"
import { getRight, buildTestRepositoriesEnvironment } from "../helpers"

it("insert and getById", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const repositoriesAdapter = buildTestRepositoriesEnvironment(dbClient)

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
  const repositoriesAdapter = buildTestRepositoriesEnvironment(dbClient)

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
  } as any

  await getRight(gamesRepositoryPorts.update(gameToUpdate)(repositoriesAdapter))()

  const updatedGame = await getRight(gamesRepositoryPorts.getById(gameId)(repositoriesAdapter))()

  mongoServer.stop()

  expect(updatedGame).toMatchObject(gameToUpdate)
})

describe("getById", () => {
  it("return null if not found", async () => {
    const mongoServer = new MongoMemoryServer()
    const mongoUri = await mongoServer.getUri()

    const dbClient = await connect(mongoUri)
    const repositoriesAdapter = buildTestRepositoriesEnvironment(dbClient)

    const insertedGame = await getRight(gamesRepositoryPorts.getById("some-id")(repositoriesAdapter))()

    mongoServer.stop()

    expect(insertedGame).toBeNull()
  })
})
