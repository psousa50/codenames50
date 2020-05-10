import * as R from "ramda"
import request from "supertest"
import { buildTestEnvironment } from "../../helpers"
import { actionOf } from "../../../src/utils/actions"
import { expressApp } from "../../../src/app/main"
import { GameStates, Teams, CodeNameGame, WordType } from "../../../src/repositories/games"
import moment from "moment"

describe("games/create", () => {
  it("create a game in idle state with one player and an empty board", async () => {
    const gameId = "some-game-id"
    const allWords = {
      words: ["w1", "w2", "w3", "w4"],
    } as any
    const insert = jest.fn((_: CodeNameGame) => actionOf(gameId))
    const environment = buildTestEnvironment({
      config: {
        numberOfWords: 0,
      },
      gamesRepository: {
        insert,
      },
      wordsRepository: {
        getByLanguage: jest.fn(() => actionOf(allWords)),
      },
      uuid: () => gameId,
      currentUtcDateTime: () => moment.utc("2000-01-01"),
    })
    const app = expressApp(environment)

    const userId = "john@something.com"

    const player1 = {
      userId,
    }
    const gameToInsert = {
      gameId,
      userId,
      players: [player1],
      state: GameStates.idle,
      turn: Teams.red,
      board: [],
      timestamp: environment.currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
    }

    await request(app).post("/api/v1/games/create").send({ userId }).expect(200, { gameId })
    expect(insert).toHaveBeenCalledWith(gameToInsert)
  })

  describe("adds a board to the game", () => {
    it("with random words", async () => {
      const allWords = {
        words: R.range(0, 30).map(i => `word-${i}`),
      } as any
      const insert = jest.fn((_: CodeNameGame) => actionOf("some-id"))
      const environment = buildTestEnvironment({
        config: {
          numberOfWords: 25,
        },
        gamesRepository: {
          insert,
        },
        wordsRepository: {
          getByLanguage: jest.fn(() => actionOf(allWords)),
        },
      })
      const app = expressApp(environment)

      await request(app).post("/api/v1/games/create").send({ userId: "some-user-id" }).expect(200)
      await request(app).post("/api/v1/games/create").send({ userId: "some-user-id" }).expect(200)
      expect(insert.mock.calls[1][0].board.length).toBe(environment.config.numberOfWords)
      expect(insert.mock.calls[1][0].board.map(b => b.word)).not.toEqual(insert.mock.calls[0][0].board.map(b => b.word))
    })

    it("with words for all teams, inocents and one assassin", async () => {
      const allWords = {
        words: R.range(0, 40).map(i => `word-${i}`),
      } as any
      const insert = jest.fn((_: CodeNameGame) => actionOf("some-id"))
      const environment = buildTestEnvironment({
        config: {
          numberOfWords: 25,
        },
        gamesRepository: {
          insert,
        },
        wordsRepository: {
          getByLanguage: jest.fn(() => actionOf(allWords)),
        },
      })
      const app = expressApp(environment)

      await request(app).post("/api/v1/games/create").send({ userId: "some-user-id" }).expect(200)
      const board = insert.mock.calls[0][0].board

      expect(board.filter(b => b.type === WordType.red).length).toBe(8)
      expect(board.filter(b => b.type === WordType.blue).length).toBe(8)
      expect(board.filter(b => b.type === WordType.inocent).length).toBe(8)
      expect(board.filter(b => b.type === WordType.assassin).length).toBe(1)
      expect(board.filter(b => b.revealed).length).toBe(0)
    })

    it("for the language chosen", async () => {
      const language = "pt"
      const environment = buildTestEnvironment({
        gamesRepository: {
          insert: jest.fn(() => actionOf("some-id")),
        },
        wordsRepository: {
          getByLanguage: jest.fn(() => actionOf({ words: [] } as any)),
        },
      })
      const app = expressApp(environment)

      await request(app).post("/api/v1/games/create").send({ userId: "some-user-id", language })
      expect(environment.wordsRepository.getByLanguage).toHaveBeenCalledWith(language)
    })

    it("gives a 404 if language does not exist", async () => {
      const environment = buildTestEnvironment({
        gamesRepository: {
          insert: jest.fn(() => actionOf("some-id")),
        },
        wordsRepository: {
          getByLanguage: jest.fn(() => actionOf(null)),
        },
      })
      const app = expressApp(environment)

      await request(app).post("/api/v1/games/create").send({ userId: "some-user-id", language: "" }).expect(404)
    })
  })
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
  } as any

  const environment = buildTestEnvironment({
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
