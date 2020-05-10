import { run } from "fp-ts/lib/ReaderTaskEither"
import { getRight, getRightAction, buildEnvironment } from "../helpers"
import { actionOf } from "../../src/utils/actions"
import * as Games from "../../src/domain/games"
import { Insert } from "../../src/repositories/models"
import { NewCodeNameGame } from "../../src/repositories/games"
import { Environment } from "../../src/environment"

it("createGame", async () => {
  const gameId = "some-game-id"
  const userId = "some-user-id"
  const insertGame = jest.fn(() => actionOf(gameId))

  const environment = buildEnvironment({
    gamesRepository: {
      insert: insertGame,
    },
  })

  const gameToCreate = { userId }

  const result = await getRightAction(Games.create({ userId }), environment)

  expect(insertGame).toHaveBeenCalledWith(gameToCreate)
  expect(result).toEqual({ gameId: gameId })
})
