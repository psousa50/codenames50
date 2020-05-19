import moment from "moment"
import * as R from "ramda"
import { DomainEnvironment } from "../../src/domain/adapters"
import { ErrorCodes } from "../../src/domain/errors"
import * as Games from "../../src/domain/main"
import { CodeNamesGame, GameStates, Teams, Words, WordType } from "../../src/domain/models"
import * as messages from "../../src/messaging/messages"
import { actionOf } from "../../src/utils/actions"
import { DeepPartial } from "../../src/utils/types"
import { buildTestDomainEnvironment, getLeft, getRight } from "../helpers"

const sortStrings = (s1: string, s2: string) => s1.localeCompare(s2)
const gameId = "some-game-id"

type EnvironmentOptions = {
  game?: CodeNamesGame
  words?: Words
}

const buildEnvironment = (partialEnv: DeepPartial<DomainEnvironment>, { game, words }: EnvironmentOptions = {}) => {
  const insertGame = jest.fn(g => actionOf(g))
  const updateGame = jest.fn(g => actionOf(g))
  const getByLanguage = jest.fn(() => actionOf(words || { language: "some-language", words: [] }))
  const emitMessage = jest.fn(() => actionOf(undefined)) as any
  const broadcastMessage = jest.fn(() => actionOf(undefined)) as any

  const defaultEnvironment = buildTestDomainEnvironment({
    config: {
      boardWidth: 5,
      boardHeight: 5,
    },
    repositoriesAdapter: {
      gamesRepositoryPorts: {
        insert: insertGame,
        update: updateGame,
        getById: jest.fn(() => actionOf(game || ({} as any))),
      },
      wordsRepositoryPorts: {
        getByLanguage,
      },
    },
    gameMessagingAdapter: {
      gameMessagingPorts: {
        emitMessage,
        broadcastMessage,
      },
    },
    currentUtcDateTime: () => moment.utc("2000-01-01"),
  })
  const domainEnvironment = R.mergeDeepRight(defaultEnvironment, partialEnv)

  return {
    domainEnvironment,
    insertGame,
    updateGame,
    getByLanguage,
    emitMessage,
    broadcastMessage,
  }
}

describe("create", () => {
  it("creates a game in idle state with one player and an empty board", async () => {
    const userId = "john@something.com"
    const words = {
      words: ["w1", "w2", "w3", "w4"],
    } as any

    const { domainEnvironment, insertGame, emitMessage } = buildEnvironment(
      {
        config: {
          boardWidth: 0,
          boardHeight: 0,
        },
      },
      { words },
    )

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
      timestamp: domainEnvironment.currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
    }

    await getRight(Games.create({ gameId, userId, language: "en" })(domainEnvironment))()

    expect(insertGame).toHaveBeenCalledWith(gameToInsert)

    expect(emitMessage).toHaveBeenCalledTimes(1)
  })

  describe("adds a board to the game", () => {
    it("with random words", async () => {
      const words = {
        words: R.range(0, 30).map(i => `word-${i}`),
      } as any
      const { domainEnvironment, insertGame } = buildEnvironment({}, { words })

      await getRight(Games.create({ gameId: "id1", userId: "some-user-id", language: "en" })(domainEnvironment))()
      await getRight(Games.create({ gameId: "id2", userId: "some-user-id", language: "en" })(domainEnvironment))()

      const firstBoard = R.flatten(insertGame.mock.calls[0][0].board)
      const secondBoard = R.flatten(insertGame.mock.calls[1][0].board)
      expect(firstBoard.length).toBe(domainEnvironment.config.boardWidth * domainEnvironment.config.boardHeight)
      expect(
        R.sort(
          sortStrings,
          firstBoard.map(b => b.word),
        ),
      ).not.toEqual(R.sort(sortStrings, words.words.slice(0, 25)))
      expect(firstBoard.map(b => b.word)).not.toEqual(secondBoard.map(b => b.word))
    })

    it("with words for both teams, inocents and one assassin", async () => {
      const words = {
        words: R.range(0, 40).map(i => `word-${i}`),
      } as any
      const { domainEnvironment, insertGame } = buildEnvironment({}, { words })

      await getRight(Games.create({ gameId, userId: "some-user-id", language: "en" })(domainEnvironment))()

      const board = R.flatten(insertGame.mock.calls[0][0].board)

      expect(board.filter(b => b.type === WordType.red).length).toBe(8)
      expect(board.filter(b => b.type === WordType.blue).length).toBe(8)
      expect(board.filter(b => b.type === WordType.inocent).length).toBe(8)
      expect(board.filter(b => b.type === WordType.assassin).length).toBe(1)
      expect(board.filter(b => b.revealed).length).toBe(0)
    })

    it("for the language chosen", async () => {
      const language = "pt"
      const { domainEnvironment, getByLanguage } = buildEnvironment({})

      await getRight(Games.create({ gameId, userId: "some-user-id", language })(domainEnvironment))()

      expect(getByLanguage).toHaveBeenCalledWith(language)
    })

    it("gives an error 404 if language does not exist", async () => {
      const getByLanguage = jest.fn(() => actionOf(null))
      const { domainEnvironment } = buildEnvironment({
        repositoriesAdapter: {
          wordsRepositoryPorts: {
            getByLanguage,
          },
        },
      })

      const r = await getLeft(Games.create({ gameId, userId: "some-user-id", language: "en" })(domainEnvironment))()

      expect(r.errorCode).toBe(ErrorCodes.LANGUAGE_NOT_FOUND)
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

    const { domainEnvironment, updateGame } = buildEnvironment({}, { game })

    const secondUserId = "second-user-id"

    const player2 = {
      userId: secondUserId,
    }

    const gameToUpdate = { gameId, userId, players: [player1, player2] }

    await getRight(Games.join({ gameId, userId: secondUserId })(domainEnvironment))()

    expect(updateGame).toHaveBeenCalledWith(gameToUpdate)
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

    const { domainEnvironment, updateGame } = buildEnvironment({}, { game })

    const gameToUpdate = { gameId, userId, players: [player1] }

    await getRight(Games.join({ gameId, userId })(domainEnvironment))()

    expect(updateGame).toHaveBeenCalledWith(gameToUpdate)
  })

  it("gives an error if the game does not exist", async () => {
    const gameId = "some-unexistant-id"
    const userId = "user-id"

    const { domainEnvironment, emitMessage } = buildEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          getById: jest.fn(() => actionOf(null)),
        },
      },
    })

    const r = await getLeft(Games.join({ gameId, userId })(domainEnvironment))()

    expect(r.errorCode).toBe(ErrorCodes.GAME_NOT_FOUND)

    expect(emitMessage).not.toHaveBeenCalled()
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

    const { domainEnvironment, broadcastMessage } = buildEnvironment({}, { game })

    const row = 0
    const col = 1
    const newGame = await getRight(Games.revealWord({ gameId, userId, row, col })(domainEnvironment))()

    expect(newGame.board[row][col].revealed).toBeTruthy()
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: messages.revealWord({ gameId, userId, row, col }),
    })
  })
})

describe("changeTurn", () => {
  const gameId = "game-id"
  const userId = "user-id"

  const buildGame = (team: Teams) =>
    ({
      gameId,
      userId,
      players: [
        {
          userId,
          team,
        },
      ],
      turn: Teams.blue,
    } as any)

  it("changes the teams turn", async () => {
    const game = buildGame(Teams.blue)
    const { domainEnvironment, broadcastMessage } = buildEnvironment({}, { game })

    const newGame = await getRight(Games.changeTurn({ gameId, userId })(domainEnvironment))()

    expect(newGame.turn).toBe(Teams.red)
    expect(broadcastMessage).toHaveBeenCalledWith({ roomId: gameId, message: messages.changeTurn({ gameId, userId }) })
  })

  it("gives an error if players is not on the team", async () => {
    const game = buildGame(Teams.red)
    const { domainEnvironment, broadcastMessage } = buildEnvironment({}, { game })

    const r = await getLeft(Games.changeTurn({ gameId, userId })(domainEnvironment))()

    expect(r.errorCode).toBe(ErrorCodes.NOT_PLAYERS_TURN)
    expect(broadcastMessage).not.toHaveBeenCalled()
  })
})

describe("setSpyMaster", () => {
  const gameId = "game-id"
  const userId = "user-id"

  const buildGame = (spyMaster: string | undefined) =>
    ({
      gameId,
      userId,
      spyMaster,
    } as any)

  it("set player as Spy Master", async () => {
    const game = buildGame(undefined)
    const { domainEnvironment, broadcastMessage } = buildEnvironment({}, { game })

    const newGame = await getRight(Games.setSpyMaster({ gameId, userId })(domainEnvironment))()

    expect(newGame.spyMaster).toBe(userId)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: messages.setSpyMaster({ gameId, userId }),
    })
  })

  it("does not allow if game already has a Spy Master", async () => {
    const game = buildGame("some-other-user-id")
    const { domainEnvironment, broadcastMessage } = buildEnvironment({}, { game })

    const r = await getLeft(Games.setSpyMaster({ gameId, userId })(domainEnvironment))()

    expect(r.errorCode).toBe(ErrorCodes.SPY_MASTER_ALREADY_SET)
    expect(broadcastMessage).not.toHaveBeenCalled()
  })
})
