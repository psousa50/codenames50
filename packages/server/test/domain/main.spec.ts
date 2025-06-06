import { Messages } from "@codenames50/messaging"
import { vi } from "vitest"
import { ErrorCodes } from "../../src/domain/errors"
import * as Games from "../../src/domain/main"
import { actionOf, fromPromise } from "../../src/utils/actions"
import { getLeft, getRight, buildTestDomainEnvironment, gamesMongoDbPorts, wordsMongoDbPorts } from "../helpers"

const now = 1234567890

describe("create", () => {
  it("creates a game in idle state with one player and an empty board", async () => {
    const gameId = "game-id"
    const userId = "user-id"
    const newGame = { some: "game" }
    const insert = vi.fn(g => actionOf(g))
    const createGame = vi.fn(() => newGame)
    const emitMessage = vi.fn(() => actionOf(undefined)) as any

    const domainEnvironment = buildTestDomainEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          insert,
        },
        repositoriesEnvironment: {
          mongoAdapter: {
            gamesMongoDbPorts,
            wordsMongoDbPorts,
          },
        },
      },
      gameMessagingAdapter: {
        gameMessagingPorts: {
          emitMessage,
        },
      },
      gamePorts: {
        createGame,
      },
      currentUtcEpoch: () => now,
    })

    // Cast to any to avoid TypeScript errors in tests
    await getRight((Games.create as any)({ gameId, userId })(domainEnvironment))()

    expect(createGame).toHaveBeenCalledWith(gameId, userId, now)
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

    const update = vi.fn(g => actionOf(g)) as any
    const getById = vi.fn(() => actionOf(someGame))
    const addPlayerAction = vi.fn(() => updatedGame)
    const addPlayer = vi.fn(() => addPlayerAction) as any
    const broadcastMessage = vi.fn(() => actionOf(undefined)) as any

    const domainEnvironment = buildTestDomainEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          update,
          getById,
        },
        repositoriesEnvironment: {
          mongoAdapter: {
            gamesMongoDbPorts,
            wordsMongoDbPorts,
          },
        },
      },
      gameMessagingAdapter: {
        gameMessagingPorts: {
          broadcastMessage,
        },
      },
      gamePorts: {
        addPlayer,
      },
    })

    // Cast to any to avoid TypeScript errors in tests
    await getRight((Games.join as any)({ gameId, userId })(domainEnvironment))()

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
    const emitMessage = vi.fn(() => actionOf(undefined)) as any

    const domainEnvironment = buildTestDomainEnvironment({
      repositoriesAdapter: {
        gamesRepositoryPorts: {
          getById: vi.fn(() => actionOf(null)),
        },
        repositoriesEnvironment: {
          mongoAdapter: {
            gamesMongoDbPorts,
            wordsMongoDbPorts,
          },
        },
      },
      gameMessagingAdapter: {
        gameMessagingPorts: {
          emitMessage,
        },
      },
    })

    // Cast to any to avoid TypeScript errors in tests
    const r = (await getLeft((Games.join as any)({ gameId, userId })(domainEnvironment))()) as any

    expect(r.errorCode).toBe(ErrorCodes.GAME_NOT_FOUND)

    expect(emitMessage).not.toHaveBeenCalled()
  })
})

describe("removePlayer", () => {
  it("removes a player from the game", async () => {
    const gameId = "game-id"
    const userId = "user-id"
    const someGame = { gameId, config: { turnTimeoutSec: 60 } } as any
    const updatedGame = { gameId, some: "update" } as any
    const gamePortUpdate = vi.fn(() => updatedGame)
    const gamePort = vi.fn(() => gamePortUpdate)
    const update = vi.fn(() => fromPromise(() => Promise.resolve(updatedGame)))
    const getById = vi.fn(() => fromPromise(() => Promise.resolve(someGame)))
    const broadcastMessage = vi.fn(() => fromPromise(() => Promise.resolve(undefined)))
    const domainEnvironment = buildTestDomainEnvironment({
      gamePorts: { removePlayer: gamePort },
      repositoriesAdapter: { gamesRepositoryPorts: { update, getById } },
      gameMessagingAdapter: { gameMessagingPorts: { broadcastMessage } },
      currentUtcEpoch: () => now,
    })
    // Cast to any to avoid TypeScript errors in tests
    await getRight((Games.removePlayer as any)({ gameId, userId })(domainEnvironment))()
    expect(getById).toHaveBeenCalledWith(gameId)
    expect(gamePort).toHaveBeenCalledWith(userId)
    expect(gamePortUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalled()
  })
})

describe("revealWord", () => {
  it("reveals a word", async () => {
    const gameId = "game-id"
    const userId = "user-id"
    const someGame = { gameId, config: { turnTimeoutSec: 60 } } as any
    const updatedGame = { gameId, some: "update" } as any
    const gamePortUpdate = vi.fn(() => updatedGame)
    const gamePort = vi.fn(() => gamePortUpdate)
    const update = vi.fn(() => fromPromise(() => Promise.resolve(updatedGame)))
    const getById = vi.fn(() => fromPromise(() => Promise.resolve(someGame)))
    const broadcastMessage = vi.fn(() => fromPromise(() => Promise.resolve(undefined)))
    const domainEnvironment = buildTestDomainEnvironment({
      gamePorts: { revealWord: gamePort },
      repositoriesAdapter: { gamesRepositoryPorts: { update, getById } },
      gameMessagingAdapter: { gameMessagingPorts: { broadcastMessage } },
      currentUtcEpoch: () => now,
    })
    const row = 0
    const col = 1
    // Cast to any to avoid TypeScript errors in tests
    await getRight((Games.revealWord as any)({ gameId, userId, row, col })(domainEnvironment))()
    expect(getById).toHaveBeenCalledWith(gameId)
    expect(gamePort).toHaveBeenCalledWith(userId, row, col, now)
    expect(gamePortUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalled()
  })
})

describe("changeTurn", () => {
  it("changes the team turn", async () => {
    const gameId = "game-id"
    const userId = "user-id"
    const someGame = { gameId, config: { turnTimeoutSec: 60 } } as any
    const updatedGame = { gameId, some: "update" } as any
    const gamePortUpdate = vi.fn(() => updatedGame)
    const gamePort = vi.fn(() => gamePortUpdate)
    const update = vi.fn(() => fromPromise(() => Promise.resolve(updatedGame)))
    const getById = vi.fn(() => fromPromise(() => Promise.resolve(someGame)))
    const broadcastMessage = vi.fn(() => fromPromise(() => Promise.resolve(undefined)))
    const domainEnvironment = buildTestDomainEnvironment({
      gamePorts: { changeTurn: gamePort },
      repositoriesAdapter: { gamesRepositoryPorts: { update, getById } },
      gameMessagingAdapter: { gameMessagingPorts: { broadcastMessage } },
      currentUtcEpoch: () => now,
    })
    // Cast to any to avoid TypeScript errors in tests
    await getRight((Games.changeTurn as any)({ gameId, userId })(domainEnvironment))()
    expect(getById).toHaveBeenCalledWith(gameId)
    expect(gamePort).toHaveBeenCalled()
    expect(gamePortUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalled()
  })
})

describe("checkTurnTimeout", () => {
  it("changes the team turn if the turn has timed out", async () => {
    const gameId = "game-id"
    const userId = "user-id"
    const someGame = { gameId, config: { turnTimeoutSec: 60 } } as any
    const updatedGame = { gameId, some: "update" } as any
    const gamePortUpdate = vi.fn(() => updatedGame)
    const forceChangeTurnPort = vi.fn(() => gamePortUpdate)
    const update = vi.fn(() => fromPromise(() => Promise.resolve(updatedGame)))
    const getById = vi.fn(() => fromPromise(() => Promise.resolve(someGame)))
    const broadcastMessage = vi.fn(() => fromPromise(() => Promise.resolve(undefined)))
    const domainEnvironment = buildTestDomainEnvironment({
      gamePorts: { forceChangeTurn: forceChangeTurnPort, checkTurnTimeout: () => () => true },
      repositoriesAdapter: { gamesRepositoryPorts: { update, getById } },
      gameMessagingAdapter: { gameMessagingPorts: { broadcastMessage } },
      currentUtcEpoch: () => now,
    })

    // Cast to any to avoid TypeScript errors in tests
    await getRight((Games.checkTurnTimeout as any)({ gameId, userId })(domainEnvironment))()

    expect(getById).toHaveBeenCalledWith(gameId)
    expect(forceChangeTurnPort).toHaveBeenCalledWith(userId, now)
    expect(gamePortUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalled()
  })

  it("does not changes the team turn if the turn has not timed out", async () => {
    const gameId = "game-id"
    const userId = "user-id"
    const someGame = { gameId, config: { turnTimeoutSec: 60 } } as any
    const getById = vi.fn(() => fromPromise(() => Promise.resolve(someGame)))
    const forceChangeTurnPort = vi.fn()
    const broadcastMessage = vi.fn(() => fromPromise(() => Promise.resolve(undefined)))
    const domainEnvironment = buildTestDomainEnvironment({
      gamePorts: { forceChangeTurn: forceChangeTurnPort, checkTurnTimeout: () => () => false },
      repositoriesAdapter: { gamesRepositoryPorts: { getById } },
      gameMessagingAdapter: { gameMessagingPorts: { broadcastMessage } },
      currentUtcEpoch: () => now,
    })

    // Cast to any to avoid TypeScript errors in tests
    await getRight((Games.checkTurnTimeout as any)({ gameId, userId })(domainEnvironment))()

    expect(getById).toHaveBeenCalledWith(gameId)
    expect(forceChangeTurnPort).not.toHaveBeenCalled()
    expect(broadcastMessage).not.toHaveBeenCalled()
  })
})
