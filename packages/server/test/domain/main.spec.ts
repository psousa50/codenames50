import { Messages } from "@codenames50/messaging"
import { ErrorCodes } from "../../src/domain/errors"
import * as Games from "../../src/domain/main"
import { actionOf } from "../../src/utils/actions"
import { getLeft, getRight } from "../helpers"

const now = 1234567890

const buildEnvironmentForGameAction = (gamePortName: string, gameForAction: any = undefined) => {
  const gameId = "game-id"
  const userId = "user-id"

  const someGame = { gameId } as any
  const updatedGame = gameForAction || ({ gameId, some: "update" } as any)

  const gamePortUpdate = jest.fn(() => updatedGame)
  const gamePort = jest.fn(() => gamePortUpdate) as any
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
    gamePorts: {
      [gamePortName]: gamePort,
    },
    currentUtcEpoch: () => now,
  } as any

  return {
    gameId,
    userId,
    domainEnvironment,
    someGame,
    updatedGame,
    gamePort,
    gamePortUpdate,
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
      gamePorts: {
        createGame,
      },
      currentUtcEpoch: () => now,
    } as any

    await getRight(Games.create({ gameId, userId })(domainEnvironment))()

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
      gamePorts: {
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
      gamePort,
      gamePortUpdate,
      update,
      broadcastMessage,
    } = buildEnvironmentForGameAction("removePlayer")

    await getRight(Games.removePlayer({ gameId, userId })(domainEnvironment))()

    expect(gamePort).toHaveBeenCalledWith(userId)
    expect(gamePortUpdate).toHaveBeenCalledWith(someGame)
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
      gamePort,
      gamePortUpdate,
      update,
      broadcastMessage,
    } = buildEnvironmentForGameAction("revealWord")

    const row = 0
    const col = 1
    await getRight(Games.revealWord({ gameId, userId, row, col })(domainEnvironment))()

    expect(gamePort).toHaveBeenCalledWith(userId, row, col, now)
    expect(gamePortUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: Messages.wordRevealed({ gameId, userId, row, col, now }),
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
      gamePort,
      gamePortUpdate,
      update,
      broadcastMessage,
    } = buildEnvironmentForGameAction("changeTurn")

    await getRight(Games.changeTurn({ gameId, userId })(domainEnvironment))()

    expect(gamePort).toHaveBeenCalled()
    expect(gamePortUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: Messages.turnChanged({ gameId, userId, now }),
    })
  })
})

describe("checkTurnTimeout", () => {
  it("changes the team turn if the turn has timed out", async () => {
    const {
      gameId,
      userId,
      domainEnvironment,
      someGame,
      updatedGame,
      gamePort,
      gamePortUpdate,
      update,
      broadcastMessage,
    } = buildEnvironmentForGameAction("changeTurn")

    const domainEnvironmentWithTurnTimedOut = {
      ...domainEnvironment,
      gamePorts: {
        ...domainEnvironment.gamePorts,
        checkTurnTimeout: () => () => true,
      },
    }
    await getRight(Games.checkTurnTimeout({ gameId, userId })(domainEnvironmentWithTurnTimedOut))()

    expect(gamePort).toHaveBeenCalled()
    expect(gamePortUpdate).toHaveBeenCalledWith(someGame)
    expect(update).toHaveBeenCalledWith(updatedGame)
    expect(broadcastMessage).toHaveBeenCalledWith({
      roomId: gameId,
      message: Messages.turnChanged({ gameId, userId, now }),
    })
  })

  it("does not changes the team turn if the turn has not timed out", async () => {
    const { gameId, userId, domainEnvironment, gamePort, broadcastMessage } = buildEnvironmentForGameAction(
      "changeTurn",
    )

    const domainEnvironmentWithTurnNotTimedOut = {
      ...domainEnvironment,
      gamePorts: {
        ...domainEnvironment.gamePorts,
        checkTurnTimeout: () => () => false,
      },
    }

    await getRight(Games.checkTurnTimeout({ gameId, userId })(domainEnvironmentWithTurnNotTimedOut))()

    expect(gamePort).not.toHaveBeenCalled()
    expect(broadcastMessage).not.toHaveBeenCalled()
  })
})
