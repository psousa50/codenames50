import { vi } from "vitest"
import * as GameMessaging from "../../src/messaging/main"
import { getRight } from "../helpers"

describe("messaging", () => {
  const gameId = "game-id"
  const userId = "some-user-id"
  const roomId = "some-room-id"
  const socketId = "some-socketId-id"

  it("emits a message to the specified user socket", async () => {
    const data = { some: "data" }
    const message = { type: "some-type" as any, data }
    const emit = vi.fn()
    const getSocketIdsForRoomId = vi.fn(() => [socketId]) as any

    const environment = {
      adapters: {
        messengerPorts: {
          emit: vi.fn(_ => emit) as any,
          broadcast: vi.fn(),
          getSocketIdsForRoomId: vi.fn(_ => getSocketIdsForRoomId),
        },
        messengerEnvironment: { io: vi.fn() as any },
      },
    }

    GameMessaging.registerUser({ userId, gameId, socketId })
    GameMessaging.registerUser({ userId: "another-user", gameId, socketId: "another-socket-id" })

    await getRight(GameMessaging.emitMessage({ userId, roomId, message })(environment))()

    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit).toHaveBeenCalledWith(socketId, message)
  })

  it("broadcasts a message to the all the users", async () => {
    const broadcast = vi.fn()
    const getSocketIdsForRoomId = vi.fn(() => [
      {
        socketId: "",
      },
    ]) as any
    const environment = {
      adapters: {
        messengerPorts: {
          emit: vi.fn(),
          broadcast: vi.fn(_ => broadcast),
          getSocketIdsForRoomId: vi.fn(_ => getSocketIdsForRoomId),
        },
        messengerEnvironment: { io: vi.fn() as any },
      },
    }

    const data = { some: "data" }
    const message = { type: "some-type" as any, data }

    GameMessaging.registerUser({ userId, gameId, socketId })
    GameMessaging.registerUser({ userId: "another-user", gameId, socketId: "another-socket-id" })

    await getRight(GameMessaging.broadcastMessage({ roomId, message })(environment))()

    expect(broadcast).toHaveBeenCalledTimes(1)
    expect(broadcast).toHaveBeenCalledWith(roomId, message)
  })

  it("unregisters a socket", async () => {
    const emit = vi.fn()
    const getSocketIdsForRoomId = vi.fn(() => [
      {
        socketId: "",
      },
    ]) as any
    const environment = {
      adapters: {
        messengerPorts: {
          emit: vi.fn(_ => emit) as any,
          broadcast: vi.fn(),
          getSocketIdsForRoomId: vi.fn(_ => getSocketIdsForRoomId),
        },
        messengerEnvironment: { io: vi.fn() as any },
      },
    }

    const data = { some: "data" }
    const message = { type: "some-type" as any, data }

    GameMessaging.registerUser({ userId, gameId, socketId })
    GameMessaging.registerUser({ userId: "another-user", gameId, socketId: "another-socket-id" })
    GameMessaging.unregisterSocket({ socketId })

    await getRight(GameMessaging.emitMessage({ userId, roomId, message })(environment))()

    expect(emit).toHaveBeenCalledTimes(0)
  })
})
