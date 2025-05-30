import { GameModels } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import request from "supertest"
import { vi } from "vitest"
import { ErrorCodes } from "../../../src/app/errors"
import { createExpressApp, configureRoutes } from "../../../src/app/main"
import { actionErrorOf, actionOf } from "../../../src/utils/actions"
import { ServiceError } from "../../../src/utils/errors"
import { buildTestExpressEnvironment } from "../../helpers"

describe("games/create", () => {
  it("creates a game", async () => {
    const createdGame = {} as GameModels.CodeNamesGame
    const create = vi.fn((_: Messages.CreateGameInput) => actionOf(createdGame))
    const expressAdapter = buildTestExpressEnvironment({
      domainAdapter: {
        gamesDomainPorts: {
          create,
        },
      },
    })

    const userId = "some-user-id"

    const app = configureRoutes(createExpressApp(), expressAdapter)

    await request(app).post("/api/v1/games/create").send({ userId }).expect(200, createdGame)
    expect(create).toHaveBeenCalledWith({ userId })
  })

  it("gives an error status if domains return an error", async () => {
    const expressAdapter = buildTestExpressEnvironment({
      domainAdapter: {
        gamesDomainPorts: {
          create: vi.fn((_: Messages.CreateGameInput) =>
            actionErrorOf(new ServiceError("error", ErrorCodes.NOT_FOUND)),
          ),
        },
      },
    })

    const app = configureRoutes(createExpressApp(), expressAdapter)

    await request(app).post("/api/v1/games/create").send({ userId: "some-user", language: "en" }).expect(404)
  })

  describe("games/join", () => {
    it("joins a game", async () => {
      const gameId = "some-game-id"
      const userId = "some-user-id"
      const game = {} as GameModels.CodeNamesGame
      const join = vi.fn((_: Messages.JoinGameInput) => actionOf(game))
      const expressAdapter = buildTestExpressEnvironment({
        domainAdapter: {
          gamesDomainPorts: {
            join,
          },
        },
      })

      const app = configureRoutes(createExpressApp(), expressAdapter)

      await request(app).post("/api/v1/games/join").send({ gameId, userId }).expect(200, game)
      expect(join).toHaveBeenCalledWith({ gameId, userId })
    })

    it("gives an error status if domains return an error", async () => {
      const expressAdapter = buildTestExpressEnvironment({
        domainAdapter: {
          gamesDomainPorts: {
            join: vi.fn((_: Messages.JoinGameInput) => actionErrorOf(new ServiceError("error", ErrorCodes.NOT_FOUND))),
          },
        },
      })

      const app = configureRoutes(createExpressApp(), expressAdapter)

      await request(app).post("/api/v1/games/join").send({ gameId: "game-id", userId: "user-id" }).expect(404)
    })
  })
})
