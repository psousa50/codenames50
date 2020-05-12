import * as R from "ramda"
import moment from "moment"
import * as Games from "../../src/domain/games"
import { getRightAction, buildTestEnvironment, getLeftAction } from "../helpers"
import { CodeNamesGame, GameStates, Teams, WordType } from "../../src/domain/models"
import { actionOf } from "../../src/utils/actions"

const sortStrings = (s1: string, s2: string) => s1.localeCompare(s2)

describe("create", () => {
  it("create a game in idle state with one player and an empty board", async () => {
    const gameId = "some-game-id"
    const allWords = {
      words: ["w1", "w2", "w3", "w4"],
    } as any
    const insert = jest.fn((game: CodeNamesGame) => actionOf(game))
    const environment = buildTestEnvironment({
      config: {
        boardWidth: 0,
        boardHeight: 0,
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

    await getRightAction(Games.create({ userId, language: "en" }), environment)

    expect(insert).toHaveBeenCalledWith(gameToInsert)
  })

  describe("adds a board to the game", () => {
    it("with random words", async () => {
      const allWords = {
        words: R.range(0, 30).map(i => `word-${i}`),
      } as any
      const insert = jest.fn((game: CodeNamesGame) => actionOf(game))
      const environment = buildTestEnvironment({
        config: {
          boardWidth: 5,
          boardHeight: 5,
        },
        gamesRepository: {
          insert,
        },
        wordsRepository: {
          getByLanguage: jest.fn(() => actionOf(allWords)),
        },
      })

      await getRightAction(Games.create({ userId: "some-user-id", language: "en" }), environment)
      await getRightAction(Games.create({ userId: "some-user-id", language: "en" }), environment)

      const firstBoard = R.flatten(insert.mock.calls[0][0].board)
      const secondBoard = R.flatten(insert.mock.calls[1][0].board)
      expect(firstBoard.length).toBe(environment.config.boardWidth * environment.config.boardHeight)
      expect(
        R.sort(
          sortStrings,
          firstBoard.map(b => b.word),
        ),
      ).not.toEqual(R.sort(sortStrings, allWords.words.slice(0, 25)))
      expect(firstBoard.map(b => b.word)).not.toEqual(secondBoard.map(b => b.word))
    })

    it("with words for all teams, inocents and one assassin", async () => {
      const allWords = {
        words: R.range(0, 40).map(i => `word-${i}`),
      } as any
      const insert = jest.fn((game: CodeNamesGame) => actionOf(game))
      const environment = buildTestEnvironment({
        config: {
          boardWidth: 5,
          boardHeight: 5,
        },
        gamesRepository: {
          insert,
        },
        wordsRepository: {
          getByLanguage: jest.fn(() => actionOf(allWords)),
        },
      })

      await getRightAction(Games.create({ userId: "some-user-id", language: "en" }), environment)

      const board = R.flatten(insert.mock.calls[0][0].board)

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
          insert: jest.fn(game => actionOf(game)),
        },
        wordsRepository: {
          getByLanguage: jest.fn(() => actionOf({ words: [] } as any)),
        },
      })
      await getRightAction(Games.create({ userId: "some-user-id", language }), environment)

      expect(environment.wordsRepository.getByLanguage).toHaveBeenCalledWith(language)
    })

    it("gives an error 404 if language does not exist", async () => {
      const environment = buildTestEnvironment({
        gamesRepository: {
          insert: jest.fn(game => actionOf(game)),
        },
        wordsRepository: {
          getByLanguage: jest.fn(() => actionOf(null)),
        },
      })

      await getLeftAction(Games.create({ userId: "some-user-id", language: "en" }), environment)
    })
  })
})

describe("join", () => {
  it("joins a user to a game", async () => {
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
        update: jest.fn(() => actionOf(game)),
      },
    })

    const secondUserId = "second-user-id"

    const player2 = {
      userId: secondUserId,
    }

    const gameToUpdate = { gameId, userId, players: [player1, player2] }

    await getRightAction(Games.join({ gameId, userId: secondUserId }), environment)

    expect(environment.gamesRepository.update).toHaveBeenCalledWith(gameToUpdate)
  })

  it("does not add user if it has already joined the game", async () => {
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
        update: jest.fn(() => actionOf(game)),
      },
    })

    const gameToUpdate = { gameId, userId, players: [player1] }

    await getRightAction(Games.join({ gameId, userId }), environment)

    expect(environment.gamesRepository.update).toHaveBeenCalledWith(gameToUpdate)
  })

  it("gives a 404 if game does not exist", async () => {
    const gameId = "some-unexistant-id"
    const userId = "user-id"

    const environment = buildTestEnvironment({
      gamesRepository: {
        getById: jest.fn(() => actionOf(null)),
      },
    })

    await getLeftAction(Games.join({ gameId, userId }), environment)
  })
})

describe("revealWord", () => {
  it("reveals a word", async () => {
    const gameId = "game-id"
    const userId = "user-id"

    const game = {
      gameId,
      userId,
      board: [
        [{ revealed: false }, { revealed: false }],
        [{ revealed: false }, { revealed: false }],
      ],
    } as any

    const environment = buildTestEnvironment({
      gamesRepository: {
        getById: jest.fn(() => actionOf(game)),
        update: jest.fn(() => actionOf(game)),
      },
    })

    const row = 0
    const col = 1
    const newGame = await getRightAction(Games.revealWord({ gameId, userId, row, col }), environment)

    expect(newGame.board[row][col].revealed).toBeTruthy()
  })
})

describe("changeTurn", () => {
  it("changes the teams turn", async () => {
    const gameId = "game-id"
    const userId = "user-id"

    const game = {
      gameId,
      userId,
      turn: Teams.blue,
    } as any

    const environment = buildTestEnvironment({
      gamesRepository: {
        getById: jest.fn(() => actionOf(game)),
        update: jest.fn(() => actionOf(game)),
      },
    })

    const newGame = await getRightAction(Games.changeTurn({ gameId, userId }), environment)
    expect(newGame.turn).toBe(Teams.red)
  })
})
