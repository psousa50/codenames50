import * as GameMessaging from "../../src/messaging/main"
import { getRight } from "../helpers"

describe("messaging", () => {
  it("emits a message to the specified user socket", async () => {
    const emit = jest.fn() as any
    const environment = {
      adapters: {
        messenger: {
          emit,
          broadcast: () => undefined,
        },
      },
    }

    const userId = "some-user-id"
    const roomId = "some-room-id"
    const socketId = "some-socketId-id"
    const data = { some: "data" }
    const message = { type: "some-type" as any, data }

    GameMessaging.register({ userId, roomId: "another-room-id", socketId: "another-socket-id" })
    GameMessaging.register({ userId, roomId, socketId })
    GameMessaging.register({ userId: "another-user", roomId, socketId: "another-socket-id" })

    await getRight(GameMessaging.emitMessage({ userId, roomId, message })(environment))()

    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit).toHaveBeenCalledWith(socketId, message)
  })

  it("broadcasts a message to the all the users", async () => {
    const broadcast = jest.fn() as any
    const environment = {
      adapters: {
        messenger: {
          emit: () => undefined,
          broadcast,
        },
      },
    }

    const userId = "some-user-id"
    const roomId = "some-room-id"
    const socketId = "some-socketId-id"
    const data = { some: "data" }
    const message = { type: "some-type" as any, data }

    GameMessaging.register({ userId, roomId, socketId })
    GameMessaging.register({ userId: "another-user", roomId, socketId: "another-socket-id" })

    await getRight(GameMessaging.broadcastMessage({ roomId, message })(environment))()

    expect(broadcast).toHaveBeenCalledTimes(1)
    expect(broadcast).toHaveBeenCalledWith(roomId, message)
  })

  it("unregisters a user", async () => {
    const emit = jest.fn() as any
    const environment = {
      adapters: {
        messenger: {
          emit,
          broadcast: () => undefined,
        },
      },
    }

    const userId = "some-user-id"
    const roomId = "some-room-id"
    const socketId = "some-socketId-id"
    const data = { some: "data" }
    const message = { type: "some-type" as any, data }

    GameMessaging.register({ userId, roomId, socketId })
    GameMessaging.register({ userId: "another-user", roomId, socketId: "another-socket-id" })
    GameMessaging.unregister({ userId, roomId, socketId })

    await getRight(GameMessaging.emitMessage({ userId, roomId, message })(environment))()

    expect(emit).toHaveBeenCalledTimes(0)
  })
})
