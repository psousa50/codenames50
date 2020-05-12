import request from "supertest"
import { buildTestEnvironment } from "../../helpers"
import { actionOf, actionErrorOf } from "../../../src/utils/actions"
import { expressApp } from "../../../src/app/main"
import * as GamesModels from "../../../src/domain/models"
import { ServiceError, ErrorCodes } from "../../../src/utils/audit"

describe("games/create", () => {
  it("creates a game", async () => {
    const createdGame = {} as GamesModels.CodeNamesGame
    const create = jest.fn((_: GamesModels.CreateGameInput) => actionOf(createdGame))
    const environment = buildTestEnvironment({
      gamesDomain: {
        create,
      },
    })
    const userId = "some-user-id"

    const app = expressApp(environment)

    await request(app).post("/api/v1/games/create").send({ userId }).expect(200, createdGame)
    expect(create).toHaveBeenCalledWith({ userId })
  })

  it("gives an error status if domains return an error", async () => {
    const environment = buildTestEnvironment({
      gamesDomain: {
        create: jest.fn((_: GamesModels.CreateGameInput) =>
          actionErrorOf<GamesModels.CodeNamesGame>(new ServiceError("error", ErrorCodes.NOT_FOUND)),
        ),
      },
    })

    const app = expressApp(environment)

    await request(app).post("/api/v1/games/create").send({ userId: "some-user", language: "en" }).expect(404)
  })

  describe("games/join", () => {
    it("joins a game", async () => {
      const gameId = "some-game-id"
      const userId = "some-user-id"
      const game = {} as GamesModels.CodeNamesGame
      const join = jest.fn((_: GamesModels.JoinGameInput) => actionOf(game))
      const environment = buildTestEnvironment({
        gamesDomain: {
          join,
        },
      })

      const app = expressApp(environment)

      await request(app).post("/api/v1/games/join").send({ gameId, userId }).expect(200, game)
      expect(join).toHaveBeenCalledWith({ gameId, userId })
    })

    it("gives an error status if domains return an error", async () => {
      const environment = buildTestEnvironment({
        gamesDomain: {
          join: jest.fn((_: GamesModels.JoinGameInput) =>
            actionErrorOf<GamesModels.CodeNamesGame>(new ServiceError("error", ErrorCodes.NOT_FOUND)),
          ),
        },
      })

      const app = expressApp(environment)

      await request(app).post("/api/v1/games/join").send({ gameId: "game-id", userId: "user-id" }).expect(404)
    })
  })
})
