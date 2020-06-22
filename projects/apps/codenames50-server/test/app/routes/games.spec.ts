import * as GamesModels from "codenames50-core/lib/models"
import request from "supertest"
import { ErrorCodes } from "../../../src/app/errors"
import { createExpressApp } from "../../../src/app/main"
import * as Messages from "codenames50-messaging/lib/messages"
import { actionErrorOf, actionOf } from "../../../src/utils/actions"
import { ServiceError } from "../../../src/utils/errors"
import { buildTestExpressEnvironment } from "../../helpers"

describe("games/create", () => {
  it("creates a game", async () => {
    const createdGame = {} as GamesModels.CodeNamesGame
    const create = jest.fn((_: Messages.CreateGameInput) => actionOf(createdGame))
    const expressAdapter = buildTestExpressEnvironment({
      domainAdapter: {
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
      domainAdapter: {
        gamesDomainPorts: {
          create: jest.fn((_: Messages.CreateGameInput) =>
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
      const join = jest.fn((_: Messages.JoinGameInput) => actionOf(game))
      const expressAdapter = buildTestExpressEnvironment({
        domainAdapter: {
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
        domainAdapter: {
          gamesDomainPorts: {
            join: jest.fn((_: Messages.JoinGameInput) =>
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