import { MongoMemoryServer } from "mongodb-memory-server"
import { gamesRepository } from "../../src/repositories/games"
import { getRightAction } from "../helpers"
import { connect } from "../../src/mongodb/main"

it("insert and getById", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const environment = {
    dbClient,
  } as any

  const gameToInsert = {
    gameId: "some-id",
    userId: "id2",
    players: [],
    something: "else",
  } as any

  const gameId = await getRightAction(gamesRepository.insert(gameToInsert), environment)

  const insertedGame = await getRightAction(gamesRepository.getById(gameId), environment)

  mongoServer.stop()

  expect(insertedGame).toMatchObject(gameToInsert)
})

it("update and getById", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const environment = {
    dbClient,
  } as any

  const gameId = "some-game-id"
  const gameToInsert = {
    gameId,
    userId: "id2",
    something: "else",
  } as any

  await getRightAction(gamesRepository.insert(gameToInsert), environment)

  const gameToUpdate = {
    gameId,
    userId: "id2",
    something: "different",
    andAlso: "this",
  } as any

  await getRightAction(gamesRepository.update(gameToUpdate), environment)

  const updatedGame = await getRightAction(gamesRepository.getById(gameId), environment)

  mongoServer.stop()

  expect(updatedGame).toMatchObject(gameToUpdate)
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
