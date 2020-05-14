import { SocketMessage, SocketMessageType } from "./messagesTypes"
import { withEnv } from "../utils/actions"
import { RevealWordInput, CreateGameInput, JoinGameInput, ChangeTurnInput } from "../domain/models"
import { pipe } from "fp-ts/lib/pipeable"
import { map, run, fromTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { task } from "fp-ts/lib/Task"
import { gameCreated, joinedGame, revealWord, changeTurn } from "./messages"
import { SocketsEnvironment, SocketsPort } from "./adapters"

type SocketHandler<T> = (socket: SocketIO.Socket) => SocketsPort<T, void>

const addMessageHandler = (socketsAdapter: SocketsEnvironment) => <T>(
  socket: SocketIO.Socket,
  type: SocketMessageType,
  handler: SocketHandler<T>,
) => {
  const h = (data: T) => {
    console.log("RECEIVED=====>\n", type, data)
    run(handler(socket)(data), socketsAdapter)
  }

  socket.on(type, h)

  return task.of(undefined)
}

export const emitMessage = <T>(socket: SocketIO.Socket, message: SocketMessage<T>) => {
  socket.emit(message.type, message.data)
}

export const broadcastMessage = <T>(io: SocketIO.Server, gameId: string, message: SocketMessage<T>) => {
  io.to(gameId).emit(message.type, message.data)
}

export const createGameHandler: SocketHandler<CreateGameInput> = socket => input =>
  withEnv(({ adapters: { io, gamesDomain } }) =>
    pipe(
      fromTaskEither(gamesDomain.create(input)),
      map(game => {
        socket.join(game.gameId)
        broadcastMessage(io, game.gameId, gameCreated(game))
        return undefined
      }),
    ),
  )

export const joinGameHandler: SocketHandler<JoinGameInput> = socket => input =>
  withEnv(({ adapters: { io, gamesDomain } }) =>
    pipe(
      fromTaskEither(gamesDomain.join(input)),
      map(game => {
        socket.join(game.gameId)
        broadcastMessage(io, game.gameId, joinedGame(game))
        return undefined
      }),
    ),
  )

export const revealWordHandler: SocketHandler<RevealWordInput> = _ => input =>
  withEnv(({ adapters: { io, gamesDomain } }) =>
    pipe(
      fromTaskEither(gamesDomain.revealWord(input)),
      map(game => {
        broadcastMessage(io, game.gameId, revealWord(input))
        return undefined
      }),
    ),
  )

export const changeTurnHandler: SocketHandler<ChangeTurnInput> = _ => input =>
  withEnv(({ adapters: { io, gamesDomain } }) =>
    pipe(
      fromTaskEither(gamesDomain.changeTurn(input)),
      map(game => {
        broadcastMessage(io, game.gameId, changeTurn(input))
        return undefined
      }),
    ),
  )

export const socketHandler = (env: SocketsEnvironment) => (socket: SocketIO.Socket) => {
  addMessageHandler(env)(socket, "createGame", createGameHandler)
  addMessageHandler(env)(socket, "joinGame", joinGameHandler)
  addMessageHandler(env)(socket, "revealWord", revealWordHandler)
  addMessageHandler(env)(socket, "changeTurn", changeTurnHandler)
}
