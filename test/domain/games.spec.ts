import moment from "moment"
import * as R from "ramda"
import { CodeNamesGame, Words } from "../../src/codenames-core/models"
import { DomainEnvironment } from "../../src/domain/adapters"
import { ErrorCodes } from "../../src/domain/errors"
import * as Games from "../../src/domain/main"
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

const timestamp = moment.utc("2000-01-01")
const buildEnvironment = (partialEnv: DeepPartial<DomainEnvironment>, { game, words }: EnvironmentOptions = {}) => {
  const insertGame = jest.fn(g => actionOf(g))
  const updateGame = jest.fn(g => actionOf(g))
  const getByLanguage = jest.fn(() => actionOf(words || { language: "some-language", words: [] }))
  const emitMessage = jest.fn(() => actionOf(undefined)) as any
  const broadcastMessage = jest.fn(() => actionOf(undefined)) as any
  const gameActions = {
    createGame: jest.fn(),
  }

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
    currentUtcDateTime: () => timestamp,
  })
  const domainEnvironment = R.mergeDeepRight(defaultEnvironment, partialEnv)

  return {
    domainEnvironment,
    insertGame,
    updateGame,
    getByLanguage,
    emitMessage,
    broadcastMessage,
    gameActions,
  }
}

describe("create", () => {
  it("creates a game in idle state with one player and an empty board", async () => {
    const userId = "john@something.com"
    const words = {
      words: ["w1", "w2", "w3", "w4"],
    } as any

    const newGame = { gameId } as any
    const createGame = jest.fn(() => newGame)
    const newBoard = { some: "board" } as any
    const buildBoard = jest.fn(() => newBoard)
    const { domainEnvironment, insertGame, emitMessage } = buildEnvironment(
      {
        config: {
          boardWidth: 0,
          boardHeight: 0,
        },
        gameActions: {
          createGame,
          buildBoard,
        },
      },
      { words },
    )

    await getRight(Games.create({ gameId, userId, language: "en" })(domainEnvironment))()

    expect(createGame).toHaveBeenCalledWith(gameId, userId, timestamp.format("YYYY-MM-DD HH:mm:ss"), newBoard)
    expect(insertGame).toHaveBeenCalledWith(newGame)

    expect(emitMessage).toHaveBeenCalledTimes(1)
  })
})

describe("join", () => {
  it("joins a user to a game", async () => {
    const gameId = "some-game-id"
    const userId = "user-id"
    const someGame = { gameId } as any
    const updatedGame = { gameId, some: "update" } as any

    const getById = jest.fn(() => actionOf(someGame))
    const addPlayerAction = jest.fn(() => updatedGame)
    const addPlayer = jest.fn(() => addPlayerAction) as any
    const { domainEnvironment, broadcastMessage, updateGame } = buildEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          getById,
        },
      },
      gameActions: {
        addPlayer,
      },
    })

    await getRight(Games.join({ gameId, userId })(domainEnvironment))()

    expect(addPlayer).toHaveBeenCalledWith(userId)
    expect(addPlayerAction).toHaveBeenCalledWith(someGame)
    expect(updateGame).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({ roomId: gameId, message: messages.joinedGame(updatedGame) })
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

    const someGame = { gameId } as any
    const updatedGame = { gameId, some: "update" } as any

    const getById = jest.fn(() => actionOf(someGame))
    const revealWordAction = jest.fn(() => updatedGame)
    const revealWord = jest.fn(() => revealWordAction) as any
    const { domainEnvironment, updateGame, broadcastMessage } = buildEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          getById,
        },
      },
      gameActions: {
        revealWord,
      },
      gameRules: {
        revealWord: () => () => undefined,
      },
    })

    const row = 0
    const col = 1
    await getRight(Games.revealWord({ gameId, userId, row, col })(domainEnvironment))()

    expect(revealWord).toHaveBeenCalledWith(userId, row, col)
    expect(revealWordAction).toHaveBeenCalledWith(someGame)
    expect(updateGame).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: messages.revealWord({ gameId, userId, row, col }),
    })
  })
})

describe("changeTurn", () => {
  it("changes the team turn", async () => {
    const gameId = "game-id"
    const userId = "user-id"

    const someGame = { gameId } as any
    const updatedGame = { gameId, some: "update" } as any

    const getById = jest.fn(() => actionOf(someGame))
    const changeTurn = jest.fn(() => updatedGame)
    const { domainEnvironment, updateGame, broadcastMessage } = buildEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          getById,
        },
      },
      gameActions: {
        changeTurn,
      },
      gameRules: {
        changeTurn: () => () => undefined,
      },
    })

    const row = 0
    const col = 1
    await getRight(Games.changeTurn({ gameId, userId })(domainEnvironment))()

    expect(changeTurn).toHaveBeenCalledWith(someGame)
    expect(updateGame).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: messages.changeTurn({ gameId, userId }),
    })
  })
})
