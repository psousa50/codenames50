import moment from "moment"
import * as R from "ramda"
import * as Games from "../../src/domain/games"
import { CodeNamesGame, GameStates, Teams, WordType } from "../../src/domain/models"
import { actionOf } from "../../src/utils/actions"
import { ErrorCodes } from "../../src/utils/audit"
import { buildTestDomainEnvironment, getLeft, getRight } from "../helpers"

const sortStrings = (s1: string, s2: string) => s1.localeCompare(s2)
const gameId = "some-game-id"

describe("create", () => {
  it("create a game in idle state with one player and an empty board", async () => {
    const userId = "john@something.com"
    const allWords = {
      words: ["w1", "w2", "w3", "w4"],
    } as any
    const insert = jest.fn((game: CodeNamesGame) => actionOf(game))
    const emitMessage = jest.fn(() => actionOf(undefined)) as any
    const domainAdapter = buildTestDomainEnvironment({
      config: {
        boardWidth: 0,
        boardHeight: 0,
      },
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          insert,
        },
        wordsRepositoryPorts: {
          getByLanguage: jest.fn(() => actionOf(allWords)),
        },
      },
      gameMessagingAdapter: {
        gameMessagingPorts: {
          emitMessage,
        },
      },
      currentUtcDateTime: () => moment.utc("2000-01-01"),
    })

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
      timestamp: domainAdapter.currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
    }

    await getRight(Games.create({ gameId, userId, language: "en" })(domainAdapter))()

    expect(insert).toHaveBeenCalledWith(gameToInsert)

    expect(emitMessage).toHaveBeenCalledTimes(1)
  })

  describe("adds a board to the game", () => {
    it("with random words", async () => {
      const allWords = {
        words: R.range(0, 30).map(i => `word-${i}`),
      } as any
      const insert = jest.fn((game: CodeNamesGame) => actionOf(game))
      const domainAdapter = buildTestDomainEnvironment({
        config: {
          boardWidth: 5,
          boardHeight: 5,
        },
        repositoriesAdapter: {
          gamesRepositoryPorts: {
            insert,
          },
          wordsRepositoryPorts: {
            getByLanguage: jest.fn(() => actionOf(allWords)),
          },
        },
      })

      await getRight(Games.create({ gameId, userId: "some-user-id", language: "en" })(domainAdapter))()
      await getRight(Games.create({ gameId, userId: "some-user-id", language: "en" })(domainAdapter))()

      const firstBoard = R.flatten(insert.mock.calls[0][0].board)
      const secondBoard = R.flatten(insert.mock.calls[1][0].board)
      expect(firstBoard.length).toBe(domainAdapter.config.boardWidth * domainAdapter.config.boardHeight)
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
      const domainAdapter = buildTestDomainEnvironment({
        config: {
          boardWidth: 5,
          boardHeight: 5,
        },
        repositoriesAdapter: {
          gamesRepositoryPorts: {
            insert,
          },
          wordsRepositoryPorts: {
            getByLanguage: jest.fn(() => actionOf(allWords)),
          },
        },
      })

      await getRight(Games.create({ gameId, userId: "some-user-id", language: "en" })(domainAdapter))()

      const board = R.flatten(insert.mock.calls[0][0].board)

      expect(board.filter(b => b.type === WordType.red).length).toBe(8)
      expect(board.filter(b => b.type === WordType.blue).length).toBe(8)
      expect(board.filter(b => b.type === WordType.inocent).length).toBe(8)
      expect(board.filter(b => b.type === WordType.assassin).length).toBe(1)
      expect(board.filter(b => b.revealed).length).toBe(0)
    })

    it("for the language chosen", async () => {
      const language = "pt"
      const domainAdapter = buildTestDomainEnvironment({
        repositoriesAdapter: {
          gamesRepositoryPorts: {
            insert: jest.fn(game => actionOf(game)),
          },
          wordsRepositoryPorts: {
            getByLanguage: jest.fn(() => actionOf({ words: [] } as any)),
          },
        },
      })

      await getRight(Games.create({ gameId, userId: "some-user-id", language })(domainAdapter))()

      expect(domainAdapter.repositoriesAdapter.wordsRepositoryPorts.getByLanguage).toHaveBeenCalledWith(language)
    })

    it("gives an error 404 if language does not exist", async () => {
      const domainAdapter = buildTestDomainEnvironment({
        repositoriesAdapter: {
          gamesRepositoryPorts: {
            insert: jest.fn(game => actionOf(game)),
          },
          wordsRepositoryPorts: {
            getByLanguage: jest.fn(() => actionOf(null)),
          },
        },
      })

      const r = await getLeft(Games.create({ gameId, userId: "some-user-id", language: "en" })(domainAdapter))()

      expect(r.errorCode).toBe(ErrorCodes.NOT_FOUND)
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

    const domainAdapter = buildTestDomainEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          getById: jest.fn(() => actionOf(game)),
          update: jest.fn(() => actionOf(game)),
        },
      },
    })

    const secondUserId = "second-user-id"

    const player2 = {
      userId: secondUserId,
    }

    const gameToUpdate = { gameId, userId, players: [player1, player2] }

    await getRight(Games.join({ gameId, userId: secondUserId })(domainAdapter))()

    expect(domainAdapter.repositoriesAdapter.gamesRepositoryPorts.update).toHaveBeenCalledWith(gameToUpdate)
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

    const domainAdapter = buildTestDomainEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          getById: jest.fn(() => actionOf(game)),
          update: jest.fn(() => actionOf(game)),
        },
      },
    })

    const gameToUpdate = { gameId, userId, players: [player1] }

    await getRight(Games.join({ gameId, userId })(domainAdapter))()

    expect(domainAdapter.repositoriesAdapter.gamesRepositoryPorts.update).toHaveBeenCalledWith(gameToUpdate)
  })

  it("gives a 404 if game does not exist", async () => {
    const gameId = "some-unexistant-id"
    const userId = "user-id"

    const domainAdapter = buildTestDomainEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          getById: jest.fn(() => actionOf(null)),
        },
      },
    })

    const r = await getLeft(Games.join({ gameId, userId })(domainAdapter))()

    expect(r.errorCode).toBe(ErrorCodes.NOT_FOUND)
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

    const domainAdapter = buildTestDomainEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          update: jest.fn(g => actionOf(g)),
          getById: jest.fn(() => actionOf(game)),
        },
      },
    })

    const row = 0
    const col = 1
    const newGame = await getRight(Games.revealWord({ gameId, userId, row, col })(domainAdapter))()

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

    const domainAdapter = buildTestDomainEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          update: jest.fn(g => actionOf(g)),
          getById: () => actionOf(game),
        },
      },
    })

    const newGame = await getRight(Games.changeTurn({ gameId, userId })(domainAdapter))()
    expect(newGame.turn).toBe(Teams.red)
  })
})
