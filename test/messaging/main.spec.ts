import express from "express"
import * as http from "http"
import socketIo, { Socket } from "socket.io"
import ioClient from "socket.io-client"
import { buildGameMessagingEnvironment } from "../../src/messaging/adapters"
import * as GameMessaging from "../../src/messaging/main"
import { buildMessengerEnvironment } from "../../src/messaging/messenger"
import { getRight } from "../helpers"

describe.skip("messaging", () => {
  it("emits a message to the specified user socket", async () => {
    const userId = "some-user-id"
    const roomId = "some-room-id"
    const socketId = "some-socketId-id"
    const data = { some: "data" }
    const message = { type: "some-type" as any, data }
    const emit = jest.fn()
    const getSocketIdsForRoomId = jest.fn(() => [
      {
        socketId,
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

  it("unregisters a user", async () => {
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

describe.skip("messaging", () => {
  it("sends a message to all clients in a room", async done => {
    const userId = "some-user-id"
    const userId2 = "some-user-id2"
    const roomId = "some-room-id"
    const roomId2 = "some-room-id2"
    const messageType = "some-type"
    const message = { type: messageType, data: { some: "data" } } as any
    const message2 = { type: messageType, data: { some: "data2" } } as any

    const port = 9001
    const app = express()
    const server = http.createServer(app)
    server.listen(port)
    const io = socketIo(server, {})

    const messengerEnvironment = buildMessengerEnvironment(io)
    const gameMessagingEnvironment = buildGameMessagingEnvironment(messengerEnvironment, {} as any)

    io.on("connect", async (socket: Socket) => {
      socket.on("registerUser", ({ userId }) => GameMessaging.registerUser({ userId, socketId: socket.id }))
      socket.on("join-room", roomId => {
        socket.join(roomId)
        socket.emit("send")
      })
    })

    const clientSocket1 = ioClient(`http://localhost:${port}`, { autoConnect: true })
    const clientSocket2 = ioClient(`http://localhost:${port}`, { autoConnect: true })

    clientSocket1.connect()

    clientSocket1.on("connect", () => {
      clientSocket1.emit("registerUser", { userId })
      clientSocket1.emit("join-room", roomId)
    })

    clientSocket1.on("send", async () => {
      await getRight(GameMessaging.emitMessage({ userId, roomId, message })(gameMessagingEnvironment))()
    })

    clientSocket2.connect()

    clientSocket2.on("connect", async () => {
      clientSocket2.emit("registerUser", { userId: userId2 })
      clientSocket2.emit("join-room", roomId2)
    })

    clientSocket1.on(messageType, (data: any) => {
      try {
        expect(data).toEqual(message.data)
      } catch (error) {
        done(error)
      }
    })

    clientSocket2.on(messageType, (data: any) => {
      io.close()
      server.close()
      try {
        expect(data).toEqual(message2.data)
      } catch (error) {
        done(error)
      }
      done()
    })
  })
})
