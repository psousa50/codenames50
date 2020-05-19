import ioClient from "socket.io-client"
import { gamesDomainPorts } from "../../src/domain/main"
import { CodeNamesGame } from "../../src/domain/models"
import { buildCompleteDomainEnvironment } from "../../src/environment"
import { gameMessagingPorts } from "../../src/messaging/main"
import * as messages from "../../src/messaging/messages"
import { messengerPorts } from "../../src/messaging/messenger"
import { gamesMongoDbPorts } from "../../src/mongodb/games"
import { wordsMongoDbPorts } from "../../src/mongodb/words"
import { buildSocketsEnvironment } from "../../src/sockets/adapters"
import { createSocketsApplication, startSocketsApplication } from "../../src/sockets/main"
import { actionOf } from "../../src/utils/actions"

const port = 9000

const emitClientMessage = (socket: SocketIOClient.Socket, message: messages.GameMessage) => {
  socket.emit(message.type, message.data)
}

export const createClient = (userId: string) => {
  const client = ioClient(`http://localhost:${port}`, { autoConnect: true })

  return new Promise<SocketIOClient.Socket>(resolve => {
    client.on("connect", () => {
      console.log("CONNECT=====>\n", userId)
      emitClientMessage(client, messages.registerUserSocket({ userId }))
      resolve(client)
    })
  })
}

const createClient2 = (userId: string) => {
  const client = ioClient(`http://localhost:${port}`, { autoConnect: true })

  client.on("connect", () => {
    console.log("CONNECT=====>\n", client.id, userId)
    emitClientMessage(client, messages.registerUserSocket({ userId }))
  })

  return client
}

const createSocketApp = () => {
  const io = createSocketsApplication(port)
  const config = { boardWidth: 2, boardHeight: 2 } as any
  const dbClient = jest.fn(() => Promise.resolve(undefined)) as any

  const insert = jest.fn(game => actionOf(game))
  const gamesRepositoryPorts = {
    insert,
  } as any

  const wordsRepositoryPorts = {
    getByLanguage: () => actionOf({ words: [] }),
  } as any

  const domainEnvironment = buildCompleteDomainEnvironment(
    config,
    dbClient,
    io,
    gamesRepositoryPorts,
    wordsRepositoryPorts,
    gamesMongoDbPorts,
    wordsMongoDbPorts,
    gameMessagingPorts,
    messengerPorts,
  )

  const socketsEnvironment = buildSocketsEnvironment(
    io,
    domainEnvironment,
    gamesDomainPorts,
    domainEnvironment.gameMessagingAdapter.gameMessagingEnvironment,
    gameMessagingPorts,
  )

  startSocketsApplication(io, socketsEnvironment)

  return io
}

describe.skip("createGame", () => {
  it("sends a new game to the user", async done => {
    const io = createSocketApp()

    const userId = "user-id"
    const client = await createClient(userId)

    client.on("gameCreated", (game: any) => {
      try {
        expect(game.userId).toEqual(userId)
        done()
      } catch (error) {
        done(error)
      } finally {
        io.close()
      }
    })

    emitClientMessage(client, messages.createGame({ userId, language: "en" }))
  })
})

describe.skip("join", () => {
  it("join a user to a game", async done => {
    const io = createSocketApp()

    const userId1 = "user-id-1"
    const userId2 = "user-id-2"
    const client1 = await createClient(userId1)
    client1.emit("test")

    io.on("test", () => {
      emitClientMessage(client1, messages.createGame({ userId: userId1, language: "en" }))

      client1.on("gameCreated", async (game: CodeNamesGame) => {
        try {
          const client2 = await createClient(userId2)
          emitClientMessage(client2, messages.joinGame({ gameId: game.gameId, userId: userId2 }))
          client2.on("joinedGame", (joinedGame: CodeNamesGame) => {
            expect(joinedGame.gameId).toBe(game.gameId)
            expect(joinedGame.players.map(p => p.userId)).toBe([userId1, userId2])
            done()
          })
        } catch (error) {
          done(error)
        } finally {
          io.close()
        }
      })
    })
  })
})
