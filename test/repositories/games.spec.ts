import { MongoMemoryServer } from "mongodb-memory-server"
import { gamesRepository } from "../../src/repositories/games"
import { buildEnvironment as buildTestEnvironment, getRightAction } from "../helpers"
import { connect } from "../../src/mongodb/main"

it("insert a Game", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const environment = {
    dbClient,
  } as any

  const gameToInsert = {
    userId: "id2",
    something: "else",
  }

  const gameId = await getRightAction(gamesRepository.insert(gameToInsert), environment)

  const insertedGame = await getRightAction(gamesRepository.getById(gameId), environment)

  mongoServer.stop()

  expect(insertedGame).toMatchObject({ ...gameToInsert, gameId })
})

describe("getById", () => {
  it("return null if not found", async () => {
    const mongoServer = new MongoMemoryServer()
    const mongoUri = await mongoServer.getUri()

    const dbClient = await connect(mongoUri)
    const environment = {
      dbClient,
    } as any

    const insertedGame = await getRightAction(gamesRepository.getById("some-id"), environment)

    mongoServer.stop()

    expect(insertedGame).toBeNull()
  })
})
