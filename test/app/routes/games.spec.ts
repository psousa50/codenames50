import request from "supertest"
import { createApp, buildEnvironment, getRight } from "../../helpers"
import { actionOf, actionErrorOf } from "../../../src/utils/actions"
import { run } from "fp-ts/lib/ReaderTaskEither"
import { createApplication, expressApp } from "../../../src/app/main"
import { ServiceError } from "../../../src/utils/audit"

it.only("games/createGame", async () => {
  const gameId = "some-game-id"
  const environment = buildEnvironment({
    gamesRepository: {
      insert: jest.fn(() => actionOf(gameId)),
    },
  })
  const app = expressApp(environment)

  const userId = "john@something.com"

  await request(app).post("/api/v1/games/").send({ userId }).expect(200, { gameId })
  expect(environment.gamesRepository.insert).toHaveBeenCalledWith({ userId })
})
