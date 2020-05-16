import request from "supertest"
import { createExpressApp } from "../../../src/app/main"
import * as GamesModels from "../../../src/domain/models"
import { actionErrorOf, actionOf } from "../../../src/utils/actions"
import { ErrorCodes, ServiceError } from "../../../src/utils/audit"
import { buildTestExpressEnvironment } from "../../helpers"

describe("games/create", () => {
  it("creates a game", async () => {
    const createdGame = {} as GamesModels.CodeNamesGame
    const create = jest.fn((_: GamesModels.CreateGameInput) => actionOf(createdGame))
    const expressAdapter = buildTestExpressEnvironment({
      adapters: {
        gamesDomainPorts: {
          create,
        },
      },
    })

    const userId = "some-user-id"

    const app = createExpressApp(expressAdapter)

    await request(app).post("/api/v1/games/create").send({ userId }).expect(200, createdGame)
    expect(create).toHaveBeenCalledWith({ userId })
  })

  it("gives an error status if domains return an error", async () => {
    const expressAdapter = buildTestExpressEnvironment({
      adapters: {
        gamesDomainPorts: {
          create: jest.fn((_: GamesModels.CreateGameInput) =>
            actionErrorOf(new ServiceError("error", ErrorCodes.NOT_FOUND)),
          ),
        },
      },
    })

    const app = createExpressApp(expressAdapter)

    await request(app).post("/api/v1/games/create").send({ userId: "some-user", language: "en" }).expect(404)
  })

  describe("games/join", () => {
    it("joins a game", async () => {
      const gameId = "some-game-id"
      const userId = "some-user-id"
      const game = {} as GamesModels.CodeNamesGame
      const join = jest.fn((_: GamesModels.JoinGameInput) => actionOf(game))
      const expressAdapter = buildTestExpressEnvironment({
        adapters: {
          gamesDomainPorts: {
            join,
          },
        },
      })

      const app = createExpressApp(expressAdapter)

      await request(app).post("/api/v1/games/join").send({ gameId, userId }).expect(200, game)
      expect(join).toHaveBeenCalledWith({ gameId, userId })
    })

    it("gives an error status if domains return an error", async () => {
      const expressAdapter = buildTestExpressEnvironment({
        adapters: {
          gamesDomainPorts: {
            join: jest.fn((_: GamesModels.JoinGameInput) =>
              actionErrorOf(new ServiceError("error", ErrorCodes.NOT_FOUND)),
            ),
          },
        },
      })

      const app = createExpressApp(expressAdapter)

      await request(app).post("/api/v1/games/join").send({ gameId: "game-id", userId: "user-id" }).expect(404)
    })
  })
})
