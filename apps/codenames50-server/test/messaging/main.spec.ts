import * as GameMessaging from "../../src/messaging/main"
import { getRight } from "../helpers"

describe("messaging", () => {
  it("emits a message to the specified user socket", async () => {
    const userId = "some-user-id"
    const roomId = "some-room-id"
    const socketId = "some-socketId-id"
    const data = { some: "data" }
    const message = { type: "some-type" as any, data }
    const emit = jest.fn()
    const getSocketIdsForRoomId = jest.fn(() => [socketId]) as any

    const environment = {
      adapters: {
        messengerPorts: {
          emit: jest.fn(_ => emit) as any,
          broadcast: () => undefined as any,
          getSocketIdsForRoomId: jest.fn(_ => getSocketIdsForRoomId),
        },
        messengerEnvironment: { io: jest.fn() as any },
      },
    }

    GameMessaging.registerUser({ userId, socketId })
    GameMessaging.registerUser({ userId: "another-user", socketId: "another-socket-id" })

    await getRight(GameMessaging.emitMessage({ userId, roomId, message })(environment))()

    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit).toHaveBeenCalledWith(socketId, message)
  })

  it("broadcasts a message to the all the users", async () => {
    const broadcast = jest.fn()
    const getSocketIdsForRoomId = jest.fn(() => [
      {
        socketId: "",
      },
    ]) as any
    const environment = {
      adapters: {
        messengerPorts: {
          emit: () => undefined as any,
          broadcast: jest.fn(_ => broadcast),
          getSocketIdsForRoomId: jest.fn(_ => getSocketIdsForRoomId),
        },
        messengerEnvironment: { io: jest.fn() as any },
      },
    }

    const userId = "some-user-id"
    const roomId = "some-room-id"
    const socketId = "some-socketId-id"
    const data = { some: "data" }
    const message = { type: "some-type" as any, data }

    GameMessaging.registerUser({ userId, socketId })
    GameMessaging.registerUser({ userId: "another-user", socketId: "another-socket-id" })

    await getRight(GameMessaging.broadcastMessage({ roomId, message })(environment))()

    expect(broadcast).toHaveBeenCalledTimes(1)
    expect(broadcast).toHaveBeenCalledWith(roomId, message)
  })

  it("unregisters a socket", async () => {
    const emit = jest.fn()
    const getSocketIdsForRoomId = jest.fn(() => [
      {
        socketId: "",
      },
    ]) as any
    const environment = {
      adapters: {
        messengerPorts: {
          emit: jest.fn(_ => emit) as any,
          broadcast: () => undefined as any,
          getSocketIdsForRoomId: jest.fn(_ => getSocketIdsForRoomId),
        },
        messengerEnvironment: { io: jest.fn() as any },
      },
    }

    const userId = "some-user-id"
    const roomId = "some-room-id"
    const socketId = "some-socketId-id"
    const data = { some: "data" }
    const message = { type: "some-type" as any, data }

    GameMessaging.registerUser({ userId, socketId })
    GameMessaging.registerUser({ userId: "another-user", socketId: "another-socket-id" })
    GameMessaging.unregisterSocket({ socketId })

    await getRight(GameMessaging.emitMessage({ userId, roomId, message })(environment))()

    expect(emit).toHaveBeenCalledTimes(0)
  })
})
