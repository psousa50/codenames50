import { SocketMessage, SocketMessageType } from "./messagesTypes"
import { Action, withEnv } from "../../utils/actions"
import { RevealWordInput, CreateGameInput, CreateGameOutput, JoinGameInput, JoinGameOutput } from "../../domain/models"
import { pipe } from "fp-ts/lib/pipeable"
import { map, run } from "fp-ts/lib/ReaderTaskEither"
import { Environment } from "../../environment"
import { task } from "fp-ts/lib/Task"
import { gameCreated, joinedGame, revealWord } from "./messages"

type SocketHandler<T> = (io: SocketIO.Server, socket: SocketIO.Socket) => Action<T, void>

const addMessageHandler = (env: Environment, io: SocketIO.Server) => <T>(
  socket: SocketIO.Socket,
  type: SocketMessageType,
  handler: SocketHandler<T>,
) => {
  const h = (data: T) => {
    console.log("RECEIVED=====>\n", type, data)
    run(handler(io, socket)(data), env)
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

export const createGameHandler: SocketHandler<CreateGameInput> = (io, socket) => input =>
  withEnv(({ gamesDomain }) =>
    pipe(
      gamesDomain.create(input),
      map(game => {
        socket.join(game.gameId)
        broadcastMessage(io, game.gameId, gameCreated(game))
        return undefined
      }),
    ),
  )

export const joinGameHandler: SocketHandler<JoinGameInput> = (io, socket) => input =>
  withEnv(({ gamesDomain }) =>
    pipe(
      gamesDomain.join(input),
      map(game => {
        socket.join(game.gameId)
        broadcastMessage(io, game.gameId, joinedGame(game))
        return undefined
      }),
    ),
  )

export const revealWordHandler: SocketHandler<RevealWordInput> = io => input =>
  withEnv(({ gamesDomain }) =>
    pipe(
      gamesDomain.revealWord(input),
      map(game => {
        broadcastMessage(io, game.gameId, revealWord(input))
        return undefined
      }),
    ),
  )

export const socketHandler = (env: Environment, io: SocketIO.Server) => (socket: SocketIO.Socket) => {
  addMessageHandler(env, io)(socket, "createGame", createGameHandler)
  addMessageHandler(env, io)(socket, "joinGame", joinGameHandler)
  addMessageHandler(env, io)(socket, "revealWord", revealWordHandler)
}
