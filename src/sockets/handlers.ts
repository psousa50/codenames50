import { pipe } from "fp-ts/lib/pipeable"
import { map, run } from "fp-ts/lib/ReaderTaskEither"
import { task } from "fp-ts/lib/Task"
import { ChangeTurnInput, JoinGameInput, RevealWordInput } from "../domain/models"
import { GameMessage, GameMessageType, RegisterUserSocketInput } from "../messaging/messages"
import { withEnv } from "../utils/actions"
import { adapt } from "../utils/adapters"
import { SocketsEnvironment, SocketsPort } from "./adapters"

type CreateGameInput = {
  userId: string
  language: string
}

type SocketHandler<T = void> = (socket: SocketIO.Socket) => SocketsPort<T, void>

const addMessageHandler = (socketsAdapter: SocketsEnvironment) => <T>(
  socket: SocketIO.Socket,
  type: GameMessageType,
  handler: SocketHandler<T>,
) => {
  const h = (data: T) => {
    console.log("RECEIVED=====>\n", type, data)
    run(handler(socket)(data), socketsAdapter)
  }

  socket.on(type, h)

  return task.of(undefined)
}

export const emitMessage = <T>(socket: SocketIO.Socket, message: GameMessage<T>) => {
  socket.emit(message.type, message.data)
}

export const broadcastMessage = <T>(io: SocketIO.Server, gameId: string, message: GameMessage<T>) => {
  io.to(gameId).emit(message.type, message.data)
}

export const registerUserHandler: SocketHandler<RegisterUserSocketInput> = socket => ({ userId }) =>
  withEnv(({ adapters: { gameMessagingPorts, gameMessagingEnvironment } }) =>
    pipe(adapt(gameMessagingPorts.registerUser({ userId, socketId: socket.id }), gameMessagingEnvironment)),
  )

export const disconnectHandler: SocketHandler = socket => () => {
  console.log("disconnectHandler=====>\n")
  return withEnv(({ adapters: { gameMessagingPorts, gameMessagingEnvironment } }) =>
    pipe(adapt(gameMessagingPorts.unregisterSocket({ socketId: socket.id }), gameMessagingEnvironment)),
  )
}

export const createGameHandler: SocketHandler<CreateGameInput> = socket => ({ userId, language }) =>
  withEnv(({ adapters: { gamesDomainPorts, domainEnvironment, uuid } }) => {
    const gameId = uuid()
    socket.join(gameId)
    return pipe(
      adapt(gamesDomainPorts.create({ gameId, userId, language }), domainEnvironment),
      map(_ => undefined),
    )
  })

export const joinGameHandler: SocketHandler<JoinGameInput> = socket => input =>
  withEnv(({ adapters: { gamesDomainPorts, domainEnvironment } }) =>
    pipe(
      adapt(gamesDomainPorts.join(input), domainEnvironment),
      map(game => {
        socket.join(game.gameId)
        return undefined
      }),
    ),
  )

export const revealWordHandler: SocketHandler<RevealWordInput> = _ => input =>
  withEnv(({ adapters: { gamesDomainPorts, domainEnvironment } }) =>
    pipe(
      adapt(gamesDomainPorts.revealWord(input), domainEnvironment),
      map(_ => undefined),
    ),
  )

export const changeTurnHandler: SocketHandler<ChangeTurnInput> = _ => input =>
  withEnv(({ adapters: { gamesDomainPorts, domainEnvironment } }) =>
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
