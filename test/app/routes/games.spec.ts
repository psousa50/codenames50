import request from "supertest"
import { buildEnvironment } from "../../helpers"
import { actionOf } from "../../../src/utils/actions"
import { expressApp } from "../../../src/app/main"

it("games/create", async () => {
  const gameId = "some-game-id"
  const environment = buildEnvironment({
    gamesRepository: {
      insert: jest.fn(() => actionOf(gameId)),
    },
  })
  const app = expressApp(environment)

  const userId = "john@something.com"

  const player1 = {
    userId,
  }

  const gameToInsert = { userId, players: [player1] }

  await request(app).post("/api/v1/games/create").send({ userId }).expect(200, { gameId })
  expect(environment.gamesRepository.insert).toHaveBeenCalledWith(gameToInsert)
})

it("games/join", async () => {
  const gameId = "some-game-id"
  const userId = "user-id"
  const player1 = {
    userId,
  }
  const game = {
    gameId,
    userId,
    players: [player1],
  }
  const environment = buildEnvironment({
    gamesRepository: {
      getById: jest.fn(() => actionOf(game)),
      update: jest.fn(() => actionOf(undefined)),
    },
  })
  const app = expressApp(environment)

  const secondUserId = "second-user-id"
  await request(app).post("/api/v1/games/join").send({ gameId, userId: secondUserId }).expect(200)

  const player2 = {
    userId: secondUserId,
  }

  const gameToUpdate = { gameId, userId, players: [player1, player2] }

  expect(environment.gamesRepository.update).toHaveBeenCalledWith(gameToUpdate)
})
