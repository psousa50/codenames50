import { pipe } from "fp-ts/lib/pipeable"
import { map, mapLeft, run } from "fp-ts/lib/ReaderTaskEither"
import { task } from "fp-ts/lib/Task"
import { ChangeTurnInput, JoinGameInput, RevealWordInput } from "../domain/models"
import { GameMessage, GameMessageType, RegisterUserSocketInput } from "../messaging/messages"
import { actionOf, withEnv } from "../utils/actions"
import { adapt } from "../utils/adapters"
import { SocketsEnvironment, SocketsPort } from "./adapters"

type CreateGameInput = {
  userId: string
  language: string
}

type SocketHandler<T = void> = (socket: SocketIO.Socket) => SocketsPort<T, void>

const addMessageHandler = (socketsEnvironment: SocketsEnvironment) => <T>(
  socket: SocketIO.Socket,
  type: GameMessageType,
  messageHandler: SocketHandler<T>,
) => {
  const handler = async (data: T) => {
    console.log("RECEIVED=====>\n", type, data)
    try {
      await run(
        pipe(
          messageHandler(socket)(data),
          mapLeft(e => {
            console.log("SOCKET ERROR=====>\n", socket.id, e)
            socket.emit("gameError", e)
          }),
        ),
        socketsEnvironment,
      )
    } catch (_) {}
  }

  socket.on(type, handler)

  return task.of(undefined)
}

export const emitMessage = <T>(socket: SocketIO.Socket, message: GameMessage<T>) => {
  socket.emit(message.type, message.data)
}

export const broadcastMessage = <T>(io: SocketIO.Server, gameId: string, message: GameMessage<T>) => {
  io.to(gameId).emit(message.type, message.data)
}

export const registerUserHandler: SocketHandler<RegisterUserSocketInput> = socket => ({ userId }) =>
  withEnv(({ gameMessagingPorts, gameMessagingEnvironment }) =>
    pipe(adapt(gameMessagingPorts.registerUser({ userId, socketId: socket.id }), gameMessagingEnvironment)),
  )

export const disconnectHandler: SocketHandler = socket => () => {
  console.log("DISCONNECT=====>\n", socket.id)
  return withEnv(({ gameMessagingPorts, gameMessagingEnvironment }) =>
    pipe(adapt(gameMessagingPorts.unregisterSocket({ socketId: socket.id }), gameMessagingEnvironment)),
  )
}
export const createGameHandler: SocketHandler<CreateGameInput> = socket => ({ userId, language }) =>
  withEnv(({ gamesDomainPorts, domainEnvironment, uuid }) => {
    const gameId = uuid()
    socket.join(gameId, async (_: any) => {
      await gamesDomainPorts.create({ gameId, userId, language })(domainEnvironment)()
    })
    return actionOf(undefined)
  })

export const joinGameHandler: SocketHandler<JoinGameInput> = socket => input => {
  return withEnv(({ gamesDomainPorts, domainEnvironment }) => {
    socket.join(input.gameId, async (_: any) => {
      await gamesDomainPorts.join(input)(domainEnvironment)()
    })
    return actionOf(undefined)
  })
}
export const revealWordHandler: SocketHandler<RevealWordInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.revealWord(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const changeTurnHandler: SocketHandler<ChangeTurnInput> = _ => input =>
  withEnv(({ gamesDomainPorts, domainEnvironment }) =>
    pipe(
      adapt(gamesDomainPorts.changeTurn(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const socketHandler = (env: SocketsEnvironment) => (socket: SocketIO.Socket) => {
  addMessageHandler(env)(socket, "disconnect", disconnectHandler)
  addMessageHandler(env)(socket, "registerUserSocket", registerUserHandler)
  addMessageHandler(env)(socket, "createGame", createGameHandler)
  addMessageHandler(env)(socket, "joinGame", joinGameHandler)
  addMessageHandler(env)(socket, "revealWord", revealWordHandler)
  addMessageHandler(env)(socket, "changeTurn", changeTurnHandler)
}
