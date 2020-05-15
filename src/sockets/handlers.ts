import { pipe } from "fp-ts/lib/pipeable"
import { fromTaskEither, map, run } from "fp-ts/lib/ReaderTaskEither"
import { task } from "fp-ts/lib/Task"
import { ChangeTurnInput, CreateGameInput, JoinGameInput, RevealWordInput } from "../domain/models"
import { GameMessage, GameMessageType } from "../messaging/models"
import { withEnv } from "../utils/actions"
import { SocketsEnvironment, SocketsPort } from "./adapters"

type SocketHandler<T> = (socket: SocketIO.Socket) => SocketsPort<T, void>

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

export const createGameHandler: SocketHandler<CreateGameInput> = socket => input =>
  withEnv(({ adapters: { gamesDomain } }) =>
    pipe(
      fromTaskEither(gamesDomain.create(input)),
      map(game => {
        socket.join(game.gameId)
        return undefined
      }),
    ),
  )

export const joinGameHandler: SocketHandler<JoinGameInput> = socket => input =>
  withEnv(({ adapters: { gamesDomain } }) =>
    pipe(
      fromTaskEither(gamesDomain.join(input)),
      map(game => {
        socket.join(game.gameId)
        return undefined
      }),
    ),
  )

export const revealWordHandler: SocketHandler<RevealWordInput> = _ => input =>
  withEnv(({ adapters: { gamesDomain } }) =>
    pipe(
      fromTaskEither(gamesDomain.revealWord(input)),
      map(_ => undefined),
    ),
  )

export const changeTurnHandler: SocketHandler<ChangeTurnInput> = _ => input =>
  withEnv(({ adapters: { gamesDomain } }) =>
    pipe(
      fromTaskEither(gamesDomain.changeTurn(input)),
      map(_ => undefined),
    ),
  )

export const socketHandler = (env: SocketsEnvironment) => (socket: SocketIO.Socket) => {
  addMessageHandler(env)(socket, "createGame", createGameHandler)
  addMessageHandler(env)(socket, "joinGame", joinGameHandler)
  addMessageHandler(env)(socket, "revealWord", revealWordHandler)
  addMessageHandler(env)(socket, "changeTurn", changeTurnHandler)
}
