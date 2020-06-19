import { CodeNamesGame, Words } from "codenames50-core/lib/models"
import moment from "moment"
import { ErrorCodes } from "../../src/domain/errors"
import * as Games from "../../src/domain/main"
import * as Messages from "codenames50-messaging/lib/messages"
import { actionOf } from "../../src/utils/actions"
import { getRight, getLeft } from "../helpers"
import { createGame } from "codenames50-core/lib/main"

const timestamp = moment.utc("2000-01-01")

const buildEnvironmentForGameAction = (gameActionName: string, gameForAction: any = undefined) => {
  const gameId = "game-id"
  const userId = "user-id"

  const someGame = { gameId } as any
  const updatedGame = gameForAction || ({ gameId, some: "update" } as any)

  const gameActionUpdate = jest.fn(() => updatedGame)
  const gameAction = jest.fn(() => gameActionUpdate) as any
  const insert = jest.fn(g => actionOf(g)) as any
  const update = jest.fn(g => actionOf(g)) as any
  const getById = jest.fn(() => actionOf(someGame))
  const broadcastMessage = jest.fn(() => actionOf(undefined)) as any
  const emitMessage = jest.fn(() => actionOf(undefined)) as any

  const domainEnvironment = {
    repositoriesAdapter: {
      gamesRepositoryPorts: {
        insert,
        update,
        getById,
      },
    },
    gameMessagingAdapter: {
      gameMessagingPorts: {
        broadcastMessage,
        emitMessage,
      },
    },
    gameActions: {
      [gameActionName]: gameAction,
    },
    gameRules: {
      [gameActionName]: () => () => undefined,
    },
    currentUtcDateTime: () => timestamp,
  } as any

  return {
    gameId,
    userId,
    domainEnvironment,
    someGame,
    updatedGame,
    gameAction,
    gameActionUpdate,
    insert,
    update,
    broadcastMessage,
    emitMessage,
  }
}

describe("create", () => {
  it("creates a game in idle state with one player and an empty board", async () => {
    const gameId = "game-id"
    const userId = "user-id"
    const newGame = { some: "game" }
    const insert = jest.fn(g => actionOf(g))
    const createGame = jest.fn(() => newGame)
    const emitMessage = jest.fn(() => actionOf(undefined)) as any

    const domainEnvironment = {
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          insert,
        },
      },
      gameMessagingAdapter: {
        gameMessagingPorts: {
          emitMessage,
        },
      },
      gameActions: {
        createGame,
      },
      currentUtcDateTime: () => timestamp,
    } as any

    await getRight(Games.create({ gameId, userId })(domainEnvironment))()

    expect(createGame).toHaveBeenCalledWith(gameId, userId, timestamp.format("YYYY-MM-DD HH:mm:ss"))
    expect(insert).toHaveBeenCalledWith(newGame)

    expect(emitMessage).toHaveBeenCalledTimes(1)
  })
})

describe("join", () => {
  it("joins a user to a game", async () => {
    const gameId = "some-game-id"
    const userId = "user-id"
    const someGame = { gameId } as any
    const updatedGame = { gameId, some: "update" } as any

    const update = jest.fn(g => actionOf(g)) as any
    const getById = jest.fn(() => actionOf(someGame))
    const addPlayerAction = jest.fn(() => updatedGame)
    const addPlayer = jest.fn(() => addPlayerAction) as any
    const broadcastMessage = jest.fn(() => actionOf(undefined)) as any

    const domainEnvironment = {
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          update,
          getById,
        },
      },
      gameMessagingAdapter: {
        gameMessagingPorts: {
          broadcastMessage,
        },
      },
      gameActions: {
        addPlayer,
      },
    } as any

    await getRight(Games.join({ gameId, userId })(domainEnvironment))()

    expect(addPlayer).toHaveBeenCalledWith(userId)
    expect(addPlayerAction).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: Messages.joinedGame({ game: updatedGame, userId }),
    })
  })

  it("gives an error if the game does not exist", async () => {
    const gameId = "some-unexistant-id"
    const userId = "user-id"
    const emitMessage = jest.fn(() => actionOf(undefined)) as any

    const domainEnvironment = {
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          getById: jest.fn(() => actionOf(null)),
        },
      },
      gameMessagingAdapter: {
        gameMessagingPorts: {
          emitMessage,
        },
      },
    } as any

    const r = await getLeft(Games.join({ gameId, userId })(domainEnvironment))()

    expect(r.errorCode).toBe(ErrorCodes.GAME_NOT_FOUND)

    expect(emitMessage).not.toHaveBeenCalled()
  })
})

describe("removePlayer", () => {
  it("removes a player from the game", async () => {
    const {
      gameId,
      userId,
      domainEnvironment,
      someGame,
      updatedGame,
      gameAction,
      gameActionUpdate,
      update,
      broadcastMessage,
    } = buildEnvironmentForGameAction("removePlayer")

    await getRight(Games.removePlayer({ gameId, userId })(domainEnvironment))()

    expect(gameAction).toHaveBeenCalledWith(userId)
    expect(gameActionUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: Messages.removePlayer({ gameId, userId }),
    })
  })
})

describe("revealWord", () => {
  it("reveals a word", async () => {
    const {
      gameId,
      userId,
      domainEnvironment,
      someGame,
      updatedGame,
      gameAction,
      gameActionUpdate,
      update,
      broadcastMessage,
    } = buildEnvironmentForGameAction("revealWord")

    const row = 0
    const col = 1
    await getRight(Games.revealWord({ gameId, userId, row, col })(domainEnvironment))()

    expect(gameAction).toHaveBeenCalledWith(userId, row, col)
    expect(gameActionUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: Messages.revealWord({ gameId, userId, row, col }),
    })
  })
})

describe("changeTurn", () => {
  it("changes the team turn", async () => {
    const {
      gameId,
      userId,
      domainEnvironment,
      someGame,
      updatedGame,
      gameAction,
      gameActionUpdate,
      update,
      broadcastMessage,
    } = buildEnvironmentForGameAction("changeTurn")

    await getRight(Games.changeTurn({ gameId, userId })(domainEnvironment))()

    expect(gameAction).toHaveBeenCalled()
    expect(gameActionUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: Messages.changeTurn({ gameId, userId }),
    })
  })
})
